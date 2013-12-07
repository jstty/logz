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
    // TODO: remove _default in favor of just using _options
    this._default = {
        env:     "dev",
        display: true,
        formatFunc:  outputFormat,
        buffer:  { size:           0,
                   deepCopy:       false,
                   formatFunc:     null,
                   showTime:       false, // TODO: remove in favor of formatFunc
                   timeFormatFunc: null,  // TODO: remove in favor of formatFunc
                   showTrace:      false  // TODO: remove in favor of formatFunc
        },
        schema: {
            "dev" : {
                // show all
                display: { log: true,  info: true,  warn:  true, error: true, trace: true, group:  true, groupEnd:  true }
            },
            "stage": {
                display: { log: false, info: false, warn:  true, error: true, trace: true, group:  true, groupEnd:  true }
            },
            "prod": {
                display: { log: false, info: false, warn: false, error: true, trace: true, group: false, groupEnd: false }
            }
        },
        groupIndentTab: " |  "
    };
    this._options = {
        env:     this._default.env,
        display: {},
        formatFunc: this._default.outputFormat,
        buffer:  deepCopy(this._default.buffer),
        schema:  deepCopy(this._default.schema),
        groupIndentTab: this._default.groupIndentTab
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
    if(!!opts) {

        if(isString(opts)){
            this._applyEnv(opts);
        }
        else if(typeof opts === 'object'){

            // if schema
            // apply schema data onto options schema
            if(opts.hasOwnProperty('schema')) {
                this._options.schema = mergeObj(this._options.schema, opts.schema);
            }

            if(opts.hasOwnProperty('env')) {
                if(isString(opts.env)) {
                    this._applyEnv(opts.env);
                }
            }

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
        }
    }
};

LogZ.prototype._applyEnv = function(env) {
    // if valid env
    if(this._options.schema.hasOwnProperty(env)) {
        this._options.env = env;
        this._options = mergeObj(this._options, this._options.schema[env]);
    }
};

LogZ.prototype._addLogType = function(type) {
    // copy console of the log type for apply (later)
    if(Console[type]) {
        this._consoleFunc[type] = Console[type];
    } else {

        // add group/groupEnd support for platforms that do not support it (eg. Node)
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

    // add display options for new type
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

            // don't add group to buffer
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

LogZ.prototype.getBuffer = function() {
    return this._dump(false);
};

// display all buffered messages
LogZ.prototype.dump = function() {
    return this._dump(true);
}

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

            // if sprintf lib exists AND
            // if first item in row is a string AND
            // if first item contains %
            if( !!sprintf &&
                isString(row[0]) &&
                (row[0].indexOf("%") !== -1) )
            {
                // then user sprintf to process string like console.log would
                row = sprintf.apply(sprintf, row);
            } else {
                row = row.join(' ');
            }

            out.push(row);
        }
    }

    return out;
};


/*
 * Utility functions
 */

function outputFormat(){
    // TODO
}


function isString(str) {
    return (Object.prototype.toString.call(str)  == '[object String]');
}

function getTrace(){
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

function mergeObj(desc, src){
    var ndesc = {};
    if ((desc instanceof Object)) {
        ndesc = deepCopy(desc);
    }

    for(var i in src) {
        if (!!src[i] && (src[i] instanceof Object) ) {
            ndesc[i] = mergeObj(ndesc[i], src[i]);
        } else {
            ndesc[i] = src[i];
        }
    }

    return ndesc;
}

function deepCopy(obj) {
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