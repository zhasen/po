var main = require("./main")
    ,recordWebSocket = require("./recordWebSocket"),
    imitateExam = require("./imitateExam"),
    interactionClass = require("./interactionClass"),
    newsAdmin = require("./newsAdmin"),
    schedules = require('./schedules');

module.exports = function(app) {
    main(app);
    recordWebSocket(app);
    imitateExam(app);
    interactionClass(app);
    schedules(app);
    newsAdmin(app);
};