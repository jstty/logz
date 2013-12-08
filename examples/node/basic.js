var moment = require('moment');
var LogZ   = require('../../lib/logz.js');

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
