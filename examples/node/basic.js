var moment = require('moment');
var LogZ   = require('../../lib/logz.js');

var logz = LogZ({
	 display: true
	,buffer: {
		size: 8,
		showTime: true,
		timeFormatFunc: function(timeDate) {
			return moment(timeDate).format('h:mm:ss a');
		},
		showTrace: true
	}
});

console.log("-- Log Output --");
logz.log("test");
logz.log("test: %s", "string");
logz.log("test: %d", 123);
logz.error("test error: %d", 123);

logz.log("before group");

logz.group("test");
    logz.log("test", "Group", 1);
    logz.warn("test", { obj: "Group1" } );

    logz.group("test 2");
        logz.log("test", "Group", 2);
        logz.warn("test", { obj: "Group2" } );
    logz.groupEnd();

logz.groupEnd();

logz.log( { after: "group", a: [1,2,3,4,5,6,7,8,9,0] } );

console.log("-- Dumping Buffered Output --");
var dump = logz.dump();

console.log("-- Printing Buffered Output --");
console.log( dump.join("\n") );
