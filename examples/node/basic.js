var LogZ = require('../../lib/logz.js');

LogZ({
	 display: true
	,global:  true
	,buffer: {
		size: 8,
		showTime: true,
		timeFormater: function(timeDate) {
			return moment(timeDate).format('h:mm:ss a');
		},
		showTrace: true
	}
});
console.log(global.logz);

console.log("-- Log Output --");
logz.log("test");
logz.log("test: %s", "string");
logz.log("test: %d", 123);

logz.log("before group");

logz.group();
logz.log("test", "Group", 1);
logz.warn("test", { obj: "Group2" } );
logz.groupEnd();

logz.log( { after: "group", a: [1,2,3,4,5,6,7,8,9,0] } );

console.log("-- Dumping Buffered Output --");

logz.dump();
