var logger = require('../commons/logging').logger;
var util = require('util');

module.exports = function(app) {
    var mode = app.get('env') || 'development';
    var assEton = require('../middlewares/asseton')(mode);
    var recordWebSocket = function(req, res, next) {
        assEton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        var user = req.user;
        page.user = user;
        res.render('recordWebSocket', input);
    };
    app.get('/record-web-socket',recordWebSocket);
};