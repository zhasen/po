var logger = require('../commons/logging').logger;
var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');

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
        input.user = {};
        res.render('test', input);
    });

    app.get('/course-schedule', function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i().enums();
        res.render('course-schedule', input);
    }); // 试验课表EJS，正式使用时不需要此路由
};