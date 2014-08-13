var main = require("./main")
    imitateExam = require("./imitateExam"),
    interactionClass = require("./interactionClass"),
    newsAdmin = require("./newsAdmin"),
    schedules = require('./schedules');

module.exports = function(app) {
    main(app);
    imitateExam(app);
    interactionClass(app);
    schedules(app);
    newsAdmin(app);
    require("./interactiveClassroomDetail")(app);
    require("./tpo")(app);
};