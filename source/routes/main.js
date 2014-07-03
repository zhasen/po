var logger = require('../commons/logging').logger;
var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var util = require('util');
var DictService = require('../services/DictService');
var request = require('request');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    auth.bind(app);//use all authentication routing and handlers binding here

    var indexPage = function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i();
        input.user = {};
        res.render('index', input);
    };
    app.get('/', indexPage);

    app.get('/test', function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i();
        input.user = req.session.user;
        res.render('test', input);
    });

    app.get('/stu', function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i();
        input.user = req.session.user;
        input.course_schedule_events = [
            {
                title: 'All Day Event',
                start: '2014-06-01'
            },
            {
                title: 'Long Event',
                start: '2014-06-07',
                end: '2014-06-10',
                color: 'red'
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: '2014-06-09T16:00:00'
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: '2014-06-16T16:00:00'
            },
            {
                title: 'Meeting',
                start: '2014-06-12T10:30:00',
                end: '2014-06-12T12:30:00'
            },
            {
                title: 'Lunch',
                start: '2014-06-12T12:00:00'
            },
            {
                title: 'Birthday Party',
                start: '2014-06-13T07:00:00'
            },
            {
                title: 'Click for Google',
                url: 'http://google.com/',
                start: '2014-06-28'
            }
        ];
        res.render('stu', input);
    });

    app.get('/tch', function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i();
        input.user = req.session.user;
        res.render('tch', input);
    })
};