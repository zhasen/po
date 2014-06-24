var Sequelize = require('sequelize');
var settings = require('./../../settings').mysql;
var sequelize = new Sequelize(settings.database, settings.user, settings.password, {
        dialect: "mysql", // or 'sqlite', 'postgres', 'mariadb'
        host:    settings.host,
        port:    settings.port
    });

sequelize
    .authenticate()
    .complete(function(err) {
        if (!!err) {
            console.log('Unable to connect to the database:', err)
        } else {
            console.log('Connection has been established successfully.')
        }
    });

module.exports = sequelize;