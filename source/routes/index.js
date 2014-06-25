var main = require("./main")
    ,recordWebSocket = require("./recordWebSocket"),
    testUser = require("./testUser");

module.exports = function(app) {
    main(app);
    recordWebSocket(app);
    testUser(app);
};