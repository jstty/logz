if (typeof window === 'undefined') {
    var LogZ   = require('../index.js');
    var chai   = require('chai');
}

var expect = chai.expect;

var logz = LogZ("basic", {
    display: false,
    buffer:  { size: 2 }
});

// ----------------------
describe("Buffer", function() {

    describe("Basic", function() {
        it( "Log", function() {
            logz.log("test1");
            var dump = logz.dump();
            expect( dump[0] ).is.equal("test1");
            logz.clear();
        });

        it( "Info", function() {
            logz.info("test2");
            var dump = logz.dump();
            expect( dump[0] ).is.equal("test2");
            logz.clear();
        });

        it( "Warn", function() {
            logz.warn("test3");
            var dump = logz.dump();
            expect( dump[0] ).is.equal("test3");
            logz.clear();
        });

        it( "Error", function() {
            logz.error("test4");
            var dump = logz.dump();
            expect( dump[0] ).is.equal("test4");
            logz.clear();
        });
    });

    // -------------------------------------
    describe("Print", function() {
        it( "Log - Int", function() {
            logz.log("Log - Int %d", 123);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Log - Int 123");
            logz.clear();
        });
        it( "Log - Float", function() {
            logz.log("Log - Float %f", 1.23);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Log - Float 1.23");
            logz.clear();
        });
        it( "Log - String", function() {
            logz.log("Log - String %s", "test");
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Log - String test");
            logz.clear();
        });
        it( "Log - Object", function() {
            logz.log("Log - Object %s", {test:123});
            var dump = logz.dump();
            expect( dump[0] ).is.equal('Log - Object {"test":123}');
            logz.clear();
        });
        // -------------------------------------
        it( "Info - Int", function() {
            logz.info("Info - Int %d", 123);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Info - Int 123");
            logz.clear();
        });
        it( "Info - Float", function() {
            logz.info("Info - Float %f", 1.23);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Info - Float 1.23");
            logz.clear();
        });
        it( "Info - String", function() {
            logz.info("Info - String %s", "test");
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Info - String test");
            logz.clear();
        });
        it( "Info - Object", function() {
            logz.info("Info - Object %s", {test:123});
            var dump = logz.dump();
            expect( dump[0] ).is.equal('Info - Object {"test":123}');
            logz.clear();
        });
        // -------------------------------------
        it( "Warn - Int", function() {
            logz.warn("Warn - Int %d", 123);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Warn - Int 123");
            logz.clear();
        });
        it( "Warn - Float", function() {
            logz.warn("Warn - Float %f", 1.23);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Warn - Float 1.23");
            logz.clear();
        });
        it( "Warn - String", function() {
            logz.warn("Warn - String %s", "test");
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Warn - String test");
            logz.clear();
        });
        it( "Warn - Object", function() {
            logz.warn("Warn - Object %s", {test:123});
            var dump = logz.dump();
            expect( dump[0] ).is.equal('Warn - Object {"test":123}');
            logz.clear();
        });
        // -------------------------------------
        it( "Error - Int", function() {
            logz.error("Error - Int %d", 123);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Error - Int 123");
            logz.clear();
        });
        it( "Error - Float", function() {
            logz.error("Error - Float %f", 1.23);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Error - Float 1.23");
            logz.clear();
        });
        it( "Error - String", function() {
            logz.error("Error - String %s", "test");
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Error - String test");
            logz.clear();
        });
        it( "Error - Object", function() {
            logz.error("Error - Object %s", {test:123});
            var dump = logz.dump();
            expect( dump[0] ).is.equal('Error - Object {"test":123}');
            logz.clear();
        });
    });

    // -------------------------------------
    describe("Multi Arguments", function() {
        it( "Log - String,Int", function() {
            logz.log("Log", 123);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Log 123");
            logz.clear();
        });
        it( "Log - String,Float", function() {
            logz.log("Log", 1.23);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Log 1.23");
            logz.clear();
        });
        it( "Log - String,Object", function() {
            logz.log("Log", {test:123});
            var dump = logz.dump();
            expect( dump[0] ).is.equal('Log {"test":123}');
            logz.clear();
        });
        it( "Log - String,String,Int", function() {
            logz.log("Log", "String", 123);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Log String 123");
            logz.clear();
        });
        it( "Log - String,Float,String", function() {
            logz.log("Log", 1.23, "String");
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Log 1.23 String");
            logz.clear();
        });
        it( "Log - String,Int,Object", function() {
            logz.log("Log", 123, {test:123});
            var dump = logz.dump();
            expect( dump[0] ).is.equal('Log 123 {"test":123}');
            logz.clear();
        });
        // -------------------------------------
        it( "Info - String,Int", function() {
            logz.info("Info", 123);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Info 123");
            logz.clear();
        });
        it( "Info - String,Float", function() {
            logz.info("Info", 1.23);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Info 1.23");
            logz.clear();
        });
        it( "Info - String,Object", function() {
            logz.info("Info", {test:123});
            var dump = logz.dump();
            expect( dump[0] ).is.equal('Info {"test":123}');
            logz.clear();
        });
        it( "Info - String,String,Int", function() {
            logz.info("Info", "String", 123);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Info String 123");
            logz.clear();
        });
        it( "Info - String,Float,String", function() {
            logz.info("Info", 1.23, "String");
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Info 1.23 String");
            logz.clear();
        });
        it( "Info - String,Int,Object", function() {
            logz.info("Info", 123, {test:123});
            var dump = logz.dump();
            expect( dump[0] ).is.equal('Info 123 {"test":123}');
            logz.clear();
        });
        // -------------------------------------
        it( "Warn - String,Int", function() {
            logz.warn("Warn", 123);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Warn 123");
            logz.clear();
        });
        it( "Warn - String,Float", function() {
            logz.warn("Warn", 1.23);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Warn 1.23");
            logz.clear();
        });
        it( "Warn - String,Object", function() {
            logz.warn("Warn", {test:123});
            var dump = logz.dump();
            expect( dump[0] ).is.equal('Warn {"test":123}');
            logz.clear();
        });
        it( "Warn - String,String,Int", function() {
            logz.warn("Warn", "String", 123);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Warn String 123");
            logz.clear();
        });
        it( "Warn - String,Float,String", function() {
            logz.warn("Warn", 1.23, "String");
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Warn 1.23 String");
            logz.clear();
        });
        it( "Warn - String,Int,Object", function() {
            logz.warn("Warn", 123, {test:123});
            var dump = logz.dump();
            expect( dump[0] ).is.equal('Warn 123 {"test":123}');
            logz.clear();
        });
        // -------------------------------------
        it( "Error - String,Int", function() {
            logz.error("Error", 123);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Error 123");
            logz.clear();
        });
        it( "Error - String,Float", function() {
            logz.error("Error", 1.23);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Error 1.23");
            logz.clear();
        });
        it( "Error - String,Object", function() {
            logz.error("Error", {test:123});
            var dump = logz.dump();
            expect( dump[0] ).is.equal('Error {"test":123}');
            logz.clear();
        });
        it( "Error - String,String,Int", function() {
            logz.error("Error", "String", 123);
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Error String 123");
            logz.clear();
        });
        it( "Error - String,Float,String", function() {
            logz.error("Error", 1.23, "String");
            var dump = logz.dump();
            expect( dump[0] ).is.equal("Error 1.23 String");
            logz.clear();
        });
        it( "Error - String,Int,Object", function() {
            logz.error("Error", 123, {test:123});
            var dump = logz.dump();
            expect( dump[0] ).is.equal('Error 123 {"test":123}');
            logz.clear();
        });
    });
});
