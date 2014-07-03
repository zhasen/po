var logger = require('../commons/logging').logger;
var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var util = require('util');
var DictService = require('../services/DictService');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

//    auth.bind(app);//use all authentication routing and handlers binding here
    //auth.bind(app);//use all authentication routing and handlers binding here

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

    app.get('/my-course-schedule-test', function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i().enums();
        //input.user = {};
        res.render('my-course-schedule-test', input);
    }); // 课表测试页

};