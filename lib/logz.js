(function(){
var Console = console;
var defaultFormatFunc = null;
var defaultGroupFormatFunc = null;
var stackTrace = null;

/*
 * Unify browser and node
 */
if(typeof(window) === 'undefined') {
    sprintf    = require('sprintf-js').sprintf;
    stackTrace = require('stack-trace');

    defaultFormatFunc      = serverFormatFunc;
    defaultGroupFormatFunc = groupFormatFunc;
    module.exports         = LogZ;
} else {
    window.LogZ            = LogZ;
}
/* -------------------------- */

/*
 * LogZ class
 */
function LogZ(opts, opts2) {
    if(!(this instanceof LogZ)) {
        return new LogZ(opts, opts2);
    }

    // --------------------------------
    this.name = null;

    this.options = {
        env:     "dev",
        replaceConsole: false, // TODO: need to implement
        display: {},
        showTrace:      false,
        formatFunc:     defaultFormatFunc,
        group :{
            autoIndent: true, // only used in node
            formatFunc: defaultGroupFormatFunc
        },
        buffer:  { size:           0,
                   formatFunc:     null,
                   showTrace:      false,
                   deepCopy:       false
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
        }
    };

    this._buffer = [];
    this.groupIndent = "";

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
    if(opts) {

        if(isString(opts)){
            this.name = opts;
            opts = opts2;
        }

        if(typeof opts === 'object'){

            // if schema
            // apply schema data onto options schema
            if(opts.hasOwnProperty('schema')) {
                this.options.schema = mergeObj(this.options.schema, opts.schema);
            }

            if(opts.hasOwnProperty('env')) {
                if(isString(opts.env)) {
                    this._applyEnv(opts.env);
                }
            }

            if(opts.hasOwnProperty('showTrace')) {
                if(typeof opts.showTrace === 'boolean') {
                    this.options.showTrace = opts.showTrace;
                }
            }

            if(opts.hasOwnProperty('replaceConsole')) {
                this.options.replaceConsole = opts.replaceConsole;
            }

            if(opts.hasOwnProperty('formatFunc')) {
                this.options.formatFunc = opts.formatFunc;
            }

            if(opts.hasOwnProperty('display')) {
                if(typeof opts.display === 'boolean') {
                    for(var d in this.options.display) {
                        this.options.display[d] = opts.display;
                    }
                }
                else if(typeof opts.display === 'object') {
                    this.options.display = mergeObj(this.options.display, opts.display);
                }
            }

            if(opts.hasOwnProperty('group')) {
                if(typeof opts.group === 'object') {
                    this.options.group = mergeObj(this.options.group, opts.group);
                }
            }

            if(opts.hasOwnProperty('buffer')) {
                if(typeof opts.buffer === 'boolean') {
                    if(!opts.buffer) opts.buffer.size = 0;
                }
                else if(typeof opts.buffer === 'number') {
                    this.options.buffer.size = opts.buffer;
                }
                else if(typeof opts.buffer === 'object') {
                    this.options.buffer = mergeObj(this.options.buffer, opts.buffer);
                }
            }
        }
    }
};

LogZ.prototype._applyEnv = function(env) {
    // if valid env
    if(this.options.schema.hasOwnProperty(env)) {
        this.options.env = env;
        this.options = mergeObj(this.options, this.options.schema[env]);
    }
};

LogZ.prototype._addLogType = function(type) {
    // copy console of the log type for apply (later)
    if(Console[type]) {
        this._consoleFunc[type] = Console[type];
    } else {

        // add group/groupEnd support for platforms that do not support it (eg. Node)
        this._consoleFunc[type] = function(){
            if(this._consoleFunc['log']) {
                this._consoleFunc['log'].apply(Console, arguments);
            }
        }.bind(this);
    }

    // add display options for new type
    this.options.display[type] = true;

    // add log type to Logger prototype
    LogZ.prototype[type] = function (){

        // if display log type, use console of that log type
        if(this.options.display[type]){
            var args = Array.prototype.slice.call(arguments, 0);

            if( type == "group" ||
                type == "groupEnd") {
                if(args.length < 1) {
                    args.push("group");
                }

                if(this.options.group.formatFunc) {
                    args = this.options.group.formatFunc(this, type, args);
                }
            }
            else {
                if(this.options.group.autoIndent){
                    // don't add group Indent to group function
                    if(this.groupIndent){
                        args.unshift(this.groupIndent);
                    }
                }
            }

            if(this.options.formatFunc) {
                args = this.options.formatFunc.apply(this.options.formatFunc, [this, args]);
            }

            this._consoleFunc[type].apply(Console, args);
        }

        // add log to buffer it buffer not exist
        if(this.options.buffer.size > 0) {
            // buffer over max
            if(this._buffer.length >= this.options.buffer.size) {
                this._buffer.shift();
            }

            var log = { time:  new Date(),
                        type:  type,
                        args:  Array.prototype.slice.call(arguments, 0)
                      };

            if(this.options.buffer.showTrace || type == "trace") {
                log.trace = this.getTrace();
            }

            // if deep copy args
            if(this.options.buffer.deepCopy) {
                log.args = deepCopy( log.args );
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

    if(this._buffer.length == 0) {
        this._consoleFunc['log'].call(Console, "Empty buffer");
        return out;
    }

    for(var b in this._buffer) {
        var log = this._buffer[b];
        if(log.type != null) {
            var row = [];

            if( this.options.buffer.formatFunc) {
                row = this.options.buffer.formatFunc.apply(this.options.buffer.formatFunc, [this, log]);
                if(isString(row)) {
                    row = [row]; // turn into array
                }
            } else {
                row = log.args;

                // show trace
                if(this.options.buffer.showTrace) {
                    row.push("-> " + log.trace );
                }
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
            if( sprintf &&
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

LogZ.prototype.getTrace = function(depth){
    if(stackTrace) {
        var trace = stackTrace.get();
        if(!depth) { depth = 2; }
        var traceItem = trace[depth];
        var filename  = traceItem.getFileName();
        var linenum   = traceItem.getLineNumber();
        var colnum    = traceItem.getColumnNumber();
        var traceOut  = filename+":"+linenum+":"+colnum;

        //console.log("traceOut:", traceOut);
        return traceOut;
    } else {
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
    }
};


/*
 * Utility functions
 */
function serverFormatFunc(lz, args) {
    var td;
    var out = [];
    var a = 0;

    // add time
    if(typeof(moment) === 'undefined') {
        td = (new Date()).toString();
    } else {
        td = moment().format('YYYY-MM-DD HH:mm:ssZ');
    }


    // if first arg is string add time to it to support % replacement
    if(typeof args[0] === "string") {
        out.push( "["+td+"] "+lz.name+" - " + args[0] );
        a++;
    } else {
        out.push("["+td+"] "+lz.name+" - ");
    }

    // add args
    for(; a < args.length; a++) {
        // if show time, and first item
        out.push( args[a] );
    }

    // add trace
    if(lz.options.showTrace){
        out.push("-> " + lz.getTrace(3));
    }

    return out;
}

function groupFormatFunc(lz, type, args){
    var groupIndentTab = " |  ";

    if(type == "group") {
        args.unshift(lz.groupIndent + " +>");
        lz.groupIndent += groupIndentTab;
        return args;
    }
    else if(type == "groupEnd") {
        lz.groupIndent = lz.groupIndent.substr(0, lz.groupIndent.length - groupIndentTab.length);
        return [lz.groupIndent + "<-"];
    }
}

function isString(str) {
    return (Object.prototype.toString.call(str)  == '[object String]');
}

function mergeObj(desc, src){
    var ndesc = {};
    if ((desc instanceof Object)) {
        ndesc = deepCopy(desc);
    }

    for(var i in src) {
        if (  src[i] &&
             (src[i] instanceof Object) &&
            !(typeof src[i] == "function") ) {
            ndesc[i] = mergeObj(ndesc[i], src[i]);
        } else {
            ndesc[i] = src[i];
        }
    }

    return ndesc;
}

function deepCopy(obj) {
    var objCopy = obj;
    if (  obj &&
         (obj instanceof Object) &&
        !(typeof obj == "function") ) {
            objCopy = (obj instanceof Array) ? [] : {};

            for(var o in obj) {
                objCopy[o] = deepCopy( obj[o] );
            }
    }
    return objCopy;
};

})();