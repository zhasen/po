var main = require("./main")
    ,recordWebSocket = require("./recordWebSocket"),
    testUser = require("./testUser");
    testPackage = require("./testPackage");
testPackage.js = require("./testPackage");
module.exports = function(app) {
    main(app);
    recordWebSocket(app);
    testUser(app);
    testPackage(app);
    testPackage(app);
};