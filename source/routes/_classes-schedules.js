var logger = require('../commons/logging').logger;
//var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var util = require('util');
var ixdf = require('../services/IXDFService');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    //auth.bind(app);//use all authentication routing and handlers binding here

    app.get('/classes-schedules-stu-:tabname', function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i();
        input.user = req.session.user;
        input.course_schedule_events = [];
        input.tabname = req.params.tabname; // 开启哪个标签
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
    });

    app.get('/class', function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i();
        input.user = req.session.user;
        res.render('class', input);
    });

    /**
     * 课表获取数据的调用地址
     */
    app.get('/schedule-data', function (req, res, next) {
        ixdf.GetTeacherByUserId('xdf00228972', function (err, ret) {
            if (err) {
                logger.error(err);
                res.json(500, err);
                return;
            }
            console.info('GetTeacherByUserId : ' + JSON.stringify(ret));
            var data = [
                {
                    id: 999,
                    title: 'Long Event',
                    start: '2014-06-24T16:00:00',
                    end: '2014-06-27T12:30:00'
                },
                {
                    title: 'Click for Google',
                    url: 'http://google.com/',
                    start: '2014-06-29'
                }
            ];
            res.json(data);
        });
    });

};