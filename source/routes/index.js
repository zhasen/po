var main = require("./main")
    ,recordWebSocket = require("./recordWebSocket"),
    imitateExam = require("./imitateExam"),
    interactionClass = require("./interactionClass"),
    _classes_schedules = require('./_classes-schedules');

module.exports = function(app) {
    main(app);
    recordWebSocket(app);
    imitateExam(app);
    interactionClass(app);
    _classes_schedules(app);
};