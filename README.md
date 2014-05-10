# LogZ [![Build Status](https://secure.travis-ci.org/jstty/logz.png)](http://travis-ci.org/jstty/logz) [![Dependency Status](https://david-dm.org/jstty/logz.png?theme=shields.io)](https://david-dm.org/jstty/logz) [![devDependency Status](https://david-dm.org/jstty/logz/dev-status.png?theme=shields.io)](https://david-dm.org/jstty/logz#info=devDependencies) [![NPM](https://nodei.co/npm/js-logz.png)](https://nodei.co/npm/js-logz/)

> A javascript template library that you define the html and template functions in a JSON.

## NPM
```sh
$ npm install js-logz
```

## Bower
```sh
$ bower install logz
```

## Usage

### Basic
```js
var logz = LogZ();

logz.log("test");
logz.info("test: %s", "string");
logz.warn("test: %d", 123);
logz.error("test error: %d", 123);
```

### Basic
```js
var logz = LogZ();

logz.log("test");
logz.info("test: %s", "string");
logz.warn("test: %d", 123);
logz.error("test error: %d", 123);
```

### Buffered Output
```js
var logz = LogZ("basic", {
    env: "dev",
    showTrace: true,
    buffer: {
        size: 8,
        showTrace: true
    }
});

console.log("----------------------------------------------------------");
console.log("-- Log Output --");
console.log("----------------------------------------------------------");
logz.log("test");
logz.info("test: %s", "string");
logz.warn("test: %d", 123);
logz.error("test error: %d", 123);

logz.log("before group");

logz.group();
    logz.log("test log", "Group", 1);
    logz.warn("test warn", { obj: "Group1" } );

    logz.group("test 2");
        logz.log("test", "Group", 2);
        logz.warn("test", { obj: "Group2" } );
    logz.groupEnd();
logz.groupEnd();

logz.log( { after: "group", a: [1,2,3,4,5,6,7,8,9,0] } );

console.log("----------------------------------------------------------");
console.log("-- Dumping Buffered Output --");
console.log("----------------------------------------------------------");
var dump = logz.dump();

console.log("----------------------------------------------------------");
console.log("-- Printing Buffered Output --");
console.log("----------------------------------------------------------");
console.log( dump.join("\n") );
```

### Custom Format
```js
var logz = LogZ("basic", {
    display: true,
    formatFunc: function(lz, args) {
        var out = [];
        var a = 0;

        // add time
        var td = moment().format('YYYY-MM-DD HH:mm:ssZ');

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

        return out;
    }
	,buffer: {
		size: 8,
        showTrace: true,
        formatFunc: function(lz, log) {
            var out = [];
            var a = 0;

            // add time
            var td = moment(log.time).format('h:mm:ss a');

            // if first arg is string add time to it to support % replacement
            if(typeof log.args[0] === "string") {
                out.push( td + " - " + log.args[0] );
                a++;
            } else {
                out.push(td + " - ");
            }

            // add args
            for(; a < log.args.length; a++) {
                // if show time, and first item
                out.push( log.args[a] );
            }

            // show trace
            if(log.trace) {
                out.push("-> " + log.trace );
            }

            return out;
        }
	}
});

console.log("----------------------------------------------------------");
console.log("-- Log Output --");
console.log("----------------------------------------------------------");
logz.log("test");
logz.info("test: %s", "string");
logz.warn("test: %d", 123);
logz.error("test error: %d", 123);

logz.log("before group");

logz.group();
    logz.log("test log", "Group", 1);
    logz.warn("test warn", { obj: "Group2" } );
    logz.trace("test trace", { obj: "Group3" } );

    logz.group("test 2");
        logz.log("test", "Group", 2);
        logz.warn("test", { obj: "Group2" } );
    logz.groupEnd();

logz.groupEnd();

logz.log( { after: "group", a: [1,2,3,4,5,6,7,8,9,0] } );

console.log("----------------------------------------------------------");
console.log("-- Dumping Buffered Output --");
console.log("----------------------------------------------------------");
var dump = logz.dump();

console.log("----------------------------------------------------------");
console.log("-- Printing Buffered Output --");
console.log("----------------------------------------------------------");
$('#logz').append(dump.join("\n"));
```