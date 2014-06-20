var settings = require('./../../settings').mysql;
var mysql = require("mysql");
var conn = mysql.createConnection({
    host: settings.host,
    user: settings.user,
    password: settings.password,
    database: settings.database,
    port: settings.port
});

var pool = mysql.createPool({
    host: settings.host,
    user: settings.user,
    password: settings.password,
    database: settings.database,
    port: settings.port
});
module.exports = pool;
