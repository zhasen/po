var winston = require("winston");
var settings = require('../../settings');

var winstonLog = new (winston.Logger)({
    transports: [
        new winston.transports.File({
            filename: settings.winstonlog.filename,
            maxsize:settings.winstonlog.maxsize,
            maxFiles:settings.winstonlog.maxFiles,
            level:settings.winstonlog.level,
            json:settings.winstonlog.json
        })
    ]
});
module.exports = winstonLog;