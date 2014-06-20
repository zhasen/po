var settings = require('../../settings');
var redis = require('./../commons/redis');

module.exports = function(express){
    var RedisStore = require('connect-redis')(express);
    var sessionStore = new RedisStore({client : redis});
    var expires = 60000 * settings.session.expires;
    return express.session({
        store: sessionStore,
        cookie: {maxAge: expires},
        secret: settings.secretKey
    });
};
