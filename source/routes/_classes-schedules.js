var logger = require('../commons/logging').logger;
//var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var util = require('util');
var request = require('request');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    //auth.bind(app);//use all authentication routing and handlers binding here

    app.get('/classes-schedules-stu', function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i();
        input.user = req.session.user;
        input.course_schedule_events = [];
        res.render('classes-schedules-stu', input);
    });

    app.get('/classes-schedules-tch', function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i();
        input.user = req.session.user;
        input.course_schedule_events = [];
        res.render('classes-schedules-tch', input);
    });

    app.get('/schedule', function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i();
        input.user = req.session.user;
        res.render('schedule', input);
    })

    app.get('/class', function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i();
        input.user = req.session.user;
        res.render('class', input);
    })

};