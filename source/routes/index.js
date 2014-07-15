var main = require("./main")
    ,recordWebSocket = require("./recordWebSocket"),
    imitateExam = require("./imitateExam"),
    interactionClass = require("./interactionClass"),
    schedules = require('./schedules');

module.exports = function(app) {
    main(app);
    recordWebSocket(app);
    imitateExam(app);
    interactionClass(app);
    schedules(app);
    require("./interactiveClassroomDetail")(app);
};