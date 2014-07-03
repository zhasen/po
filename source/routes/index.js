var main = require("./main")
    , recordWebSocket = require("./recordWebSocket"),
    imitateExam = require("./imitateExam");
module.exports = function (app) {
    main(app);
    recordWebSocket(app);
    imitateExam(app);
};