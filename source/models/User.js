var Sequelize = require('sequelize');
var sequelize = require('../commons/sequelize');
var typeRegistry = require('./TypeRegistry');

var User = sequelize.define('User',
    {
        id: {type: Sequelize.STRING, primaryKey: true},
        lifeFlag: {
            type: Sequelize.ENUM,
            values: typeRegistry.LifeFlag.valueList(),
            defaultValue: typeRegistry.LifeFlag.Active.value()
        },
        type: {
            type: Sequelize.ENUM,
            values: typeRegistry.UserType.valueList(),
            defaultValue: typeRegistry.UserType.OAuth.value()
        },
        displayName: {type: Sequelize.STRING},
        username: {type: Sequelize.STRING},
        password: {type: Sequelize.STRING},
        email: {type: Sequelize.STRING},
        phone: {type: Sequelize.STRING},
        accessToken: {type: Sequelize.STRING},
        refreshToken: {type: Sequelize.STRING},
        expiresIn: {type: Sequelize.DATE}
    },
    {
        tableName: 'user'
    }
);
module.exports = User;