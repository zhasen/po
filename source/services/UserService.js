var settings = require('../../settings');
var logger = require('../commons/logging').logger;
var User = require('../models/User');
var typeRegistry = require('../models/TypeRegistry');
var crypto = require('crypto');

var generateUserToken = function(uid){
    var key = settings.secretKey;
    return crypto.createHash('sha1').update(String(uid)).update(key).digest('hex');
};
var UserService = {
    loadById: function(id, callback){
        User
            .find({ where: { id: id } })
            .complete(function(err, user) {
                if (err) {
                    var errMsg = 'Fail to find user by XDF Passport user id: ' + err.message;
                    logger.error(errMsg);
                    callback(new Error(errMsg), null);
                } else if (!user) {
                    callback(null, null);
                } else {
                    callback(null, user);
                }
            });
    },
    createFromOAuth: function(userObj, callback){
        //Populate default values
        userObj.lifeFlag = typeRegistry.LifeFlag.Active.value();
        userObj.type = typeRegistry.UserType.OAuth.value();

        //Save the model instance
        var user = User.build(userObj);
        user.save()
            .complete(function (err) {
                if (err) {
                    var errMsg = 'Fail to create user from XDF Passport: ' + err.message;
                    logger.error(errMsg);
                    callback(new Error(errMsg), user);
                } else {
                    callback(null, user);
                }
            });
    }
};
module.exports = UserService;