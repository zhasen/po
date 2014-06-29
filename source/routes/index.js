var main = require("./main")
    ,recordWebSocket = require("./recordWebSocket");
module.exports = function(app) {
    main(app);
    recordWebSocket(app);
};