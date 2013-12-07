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

function LogZ(opts) {
	if(!(this instanceof LogZ)) {
		// being called globally, shortcut
		if(opts.hasOwnProperty('global') && opts.global) {
			// setting global to false so new Logger does not recurisize loop
			opts.global = false;
			// try window and then try global for node.js support
			global.logz = new LogZ(opts);
		}
		return;
	}

	// --------------------------------
	this._default = {
		display: true,
		buffer:  { size:      0,
			       deepCopy:  false,
			       showTime:  false,
			       timeFormater: null,
			       showTrace: false }
	};
	this._options = {
		display: {},
		buffer: { size:         this._default.buffer.size,
				  deepCopy:     this._default.buffer.deepCopy,
				  showTime:     this._default.buffer.showTime,
				  timeFormater: this._default.buffer.timeFormat,
				  showTrace:    this._default.buffer.showTrace
				},
		global: false
	};

	// TODO - Add option to write to DB instead of buffer
	this._buffer = [];

	this._consoleFunc = {};
	this._addLogType('log');
	this._addLogType('warn');
	this._addLogType('error');
	this._addLogType('info');
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

	// if global set and not called as function (shortcut above will prevent this)
	if(this._options.global) {
		// try window and then try global for node.js support
		try { if(!!window) { window.logz = this; } } catch(e) { }
		try { if(!!global) { global.logz = this; } } catch(e) { }
	}
};

LogZ.prototype = {

	_addLogType: function(type) {
		// copy console of the log type for apply (later)
		this._consoleFunc[type] = Function.prototype.bind.call(Console[type], Console);
		// add options
		this._options.display[type] = this._default.display;
		
		// add log type to Logger prototype
		LogZ.prototype[type] = function (){

			// if display log type, use console of that log type
			if(this._options.display[type]){
				this._consoleFunc[type].apply(Console, arguments);
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

				if(this._options.buffer.showTrace) {
					log.trace = getTrace();
				}
				// if deep copy args
				if(this._options.buffer.deepCopy) {
					log.args = deepCopy( args );
				}

				this._buffer.push(log);
			}
		};
	},

	clear: function(opts) {
		this._buffer = [];
	},

	// display all buffered messages
	dump: function(opts) {
		// TODO add filters

		var args;
		for(var b in this._buffer) {
			var log = this._buffer[b];
			if(log.type != null) {
				var out = [];

				if(this._options.buffer.showTime) {
					var a = 0;
					var td = log.time;
					if(!!this._options.buffer.timeFormater) {
						td = this._options.buffer.timeFormater(td);
					} else {
						td = td.toString();
					}

				  	if(typeof log.args[a] === "string") {
				  		out.push( td + " - " + log.args[a] );
				  		a++;
			  		} else {
			  			out.push( td + " - ");
			  		}

			  		for(; a < log.args.length; a++) {
						// if show time, and first item
						out.push( log.args[a] );
					}
			  	} else {
			  		out = log.args;
			  	}

			  	if(this._options.buffer.showTrace) {
			  		out.push( "\t-> " + log.trace );
			  	}

				this._consoleFunc[log.type].apply(Console, out);
			}
		}
	}
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

if(global._browserPlatform) { global.LogZ    = LogZ; }
else 						{ module.exports = LogZ; }

})();