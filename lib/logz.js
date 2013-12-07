(function(){

/*
 * Unify browser and node
 */
var global = {};
if(typeof(window) === 'undefined') {
    window = global;
    global._browserPlatform = false;
} else {
    global = window;
    global._browserPlatform = true;
}
/* -------------------------- */

var Console = console;

if(global._browserPlatform) { global.LogZ    = LogZ; }
else 						{ module.exports = LogZ; }

/*
 * LogZ class
 */
function LogZ(opts) {
    if(!(this instanceof LogZ)) {
        return new LogZ(opts);
    }

    // --------------------------------
    this._default = {
        display: true,
        buffer:  { size:           0,
                   deepCopy:       false,
                   showTime:       false,
                   timeFormatFunc: null,
                   showTrace:      false },
        groupIndentTab: " |  "
    };
    this._options = {
        display: {},
        buffer: { size:           this._default.buffer.size,
                  deepCopy:       this._default.buffer.deepCopy,
                  showTime:       this._default.buffer.showTime,
                  timeFormatFunc: this._default.buffer.timeFormatFunc,
                  showTrace:      this._default.buffer.showTrace
                },
        groupIndentTab: " |  "
    };

    this._buffer = [];
    this._groupIndent = "";

    this._consoleFunc = {};
    this._addLogType('log');
    this._addLogType('warn');
    this._addLogType('error');
    this._addLogType('info');
    this._addLogType('trace');
    this._addLogType('group');
    this._addLogType('groupEnd');

    // --------------------------------
    // process options
    if(!!opts && (typeof opts === 'object')){
        if(opts.hasOwnProperty('display')) {
            if(typeof opts.display === 'boolean') {
                for(var d in this._options.display) {
                    this._options.display[d] = opts.display;
                }
            }
            else if(typeof opts.display === 'object') {
                for(var d in opts.display){
                    this._options.display[d] = opts.display[d];
                }
            }
        }

        if(opts.hasOwnProperty('buffer')) {
            if(typeof opts.buffer === 'boolean') {
                if(!opts.buffer) opts.buffer.size = 0;
            }
            else if(typeof opts.buffer === 'number') {
                this._options.buffer.size = opts.buffer;
            }
            else if(typeof opts.buffer === 'object') {
                this._options.buffer = opts.buffer;
            }
        }

        if(opts.hasOwnProperty('global')) this._options.global = opts.global;
    }
};

LogZ.prototype._addLogType = function(type) {
    // copy console of the log type for apply (later)
    if(Console[type]) {
        this._consoleFunc[type] = Console[type];
    } else {

        if(type == "group") {
            this._consoleFunc[type] = function(gname){
                if(this._consoleFunc['log']) {
                    if(gname) { gname = "["+gname+"]"; }
                    else gname = "";

                    this._consoleFunc['log'].call(Console, this._groupIndent+" +> "+gname);
                    this._groupIndent += this._options.groupIndentTab;
                }
            }.bind(this);
        }
        else if(type == "groupEnd") {
            this._consoleFunc[type] = function(){
                this._groupIndent = this._groupIndent.substr(0, this._groupIndent.length - this._options.groupIndentTab.length);

                if(this._consoleFunc['log']) {
                    this._consoleFunc['log'].call(Console, this._groupIndent+"<-");
                }
            }.bind(this);
        }
        else {
            this._consoleFunc[type] = function(){
                if(this._consoleFunc['log']) {
                    this._consoleFunc['log'].apply(Console, arguments);
                }
            }.bind(this);
        }
    }
    /*
    if(global._browserPlatform) {
        this._consoleFunc[type] = Function.prototype.bind.call(Console[type], Console);
    }
    */

    // add options
    this._options.display[type] = this._default.display;

    // add log type to Logger prototype
    LogZ.prototype[type] = function (){

        // if display log type, use console of that log type
        if(this._options.display[type]){
            var args = arguments;

            // don't add group Indent to group function
            if(type != "group") {
                if(this._groupIndent){
                    args = Array.prototype.slice.call(arguments, 0);
                    args.unshift(this._groupIndent);
                }
            }

            this._consoleFunc[type].apply(Console, args);
        }

        // add log to buffer it buffer not exist
        if(this._options.buffer.size > 0) {
            // buffer over max
            if(this._buffer.length >= this._options.buffer.size) {
                this._buffer.shift();
            }

            var log = { time:  new Date(),
                        type:  type,
                        args:  Array.prototype.slice.call(arguments, 0)
                      };

            if(this._options.buffer.showTrace || type == "trace") {
                log.trace = getTrace();
            }
            // if deep copy args
            if(this._options.buffer.deepCopy) {
                log.args = deepCopy( args );
            }

            if(type != "group" &&
               type != "groupEnd" ) {
                this._buffer.push(log);
            }
        }
    };
};

LogZ.prototype.clear = function() {
    this._buffer = [];
};

LogZ.prototype.getRawBuffer = function() {
    return this._buffer;
};

// display all buffered messages
LogZ.prototype.getBuffer = function() {
    return this._dump(false);
};

LogZ.prototype.dump = function() {
    return this._dump(true);
}

// display all buffered messages
LogZ.prototype._dump = function(display) {
    var out = [];

    for(var b in this._buffer) {
        var log = this._buffer[b];
        if(log.type != null) {
            var row = [];

            if(this._options.buffer.showTime) {
                var a = 0;
                var td = log.time;
                if(!!this._options.buffer.timeFormatFunc) {
                    td = this._options.buffer.timeFormatFunc(td);
                } else {
                    td = td.toString();
                }

                if(typeof log.args[a] === "string") {
                    row.push( td + " - " + log.args[a] );
                    a++;
                } else {
                    row.push( td + " - ");
                }

                for(; a < log.args.length; a++) {
                    // if show time, and first item
                    row.push( log.args[a] );
                }
            } else {
                row = log.args;
            }

            if(this._options.buffer.showTrace) {
                row.push( "\t-> " + log.trace );
            }

            if(display) {
                this._consoleFunc[log.type].apply(Console, row);
            }

            // convert all object to strings
            for(a = 0; a < row.length; a++) {
                if(typeof row[a] === 'object') {
                    row[a] = JSON.stringify(row[a]);
                }
            }

            // if sprintf lib exists
            if(sprintf) {
                if(Object.prototype.toString.call(row[0])  == '[object String]') {
                    if(row[0]){

                    }
                }
            }

            out.push(row.join(' '));
        }
    }

    return out;
};

var getTrace = function(){
    try{
        trigger.error = 1/0;
    } catch (e) {
        var trace = e.stack.toString();
        trace = trace.split("\n");
        trace = trace.pop(); // get item
        trace = trace.replace("at", ""); // remove at verb
        trace = trace.replace(/^\s+|\s+$/g, ''); // remove whitespace
        return trace;
    }
};

var deepCopy = function(obj) {
    var objCopy = obj;
    if (!!obj && (obj instanceof Object) ) {
        objCopy = (obj instanceof Array) ? [] : {};
        for(var o in obj) {
            objCopy[o] = deepCopy( obj[o] );
        }
    }
    return objCopy;
};

})();