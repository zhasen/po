var logger = require('../commons/logging').logger;
var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var util = require('util');
var DictService = require('../services/DictService');

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

    app.get('/course-schedule', function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i().enums();
        res.render('course-schedule', input);
    }); // 试验课表EJS，正式使用时不需要此路由
    //为试卷列表查询数据并传输到模板
//    var testPaperIndexPage = function (req, res, next) {
//        asseton(req, res);
//        var input = {};
//        var page = {};
//        input.page = page;
//        page.user = req.user;
//        page.papers = {};
//        page.papers.paperType = Papers.paperType;
//        page.papers.paperPublish = Papers.paperPublish;
//        page.papers.testArea = Papers.testArea;
//        TestPapersService.listTestPapers(function (err, list) {
//            if (err) {
//                logger.error(err);
//                res.json(500, err); //TODO response a json document with error info
//                return;
//            }
//            page.testPapers = list;
//            console.log(input);
//            res.render('tp-index', input);
//        });
//    };


//    //练习包列表查询数据并传输到模板
//    var testExercisePackList = function (req, res, next) {
//        asseton(req, res);
//        var input = {};
//        var page = {};
//        input.page = page;
//        page.user = req.user;
//        page.papers = {};
//        page.papers.paperType = Papers.paperType;
//        page.papers.paperPublish = Papers.paperPublish;
//        page.papers.testArea = Papers.testArea;
//        TestExercisePackService.listTestPapers(function (err, list) {
//            if (err) {
//                logger.error(err);
//                res.json(500, err); //TODO response a json document with error info
//                return;
//            }
//            page.testPapers = list;
//            console.log(input);
//            res.render('tep-list', input);
//        });
//    };

    //练习包列表查询数据并传输到模板
//    var ssoLoginCallback = function (req, res, next) {
//        asseton(req, res);
//        var input = {};
//        var page = {};
//        input.page = page;
//        page.user = req.user;
//        page.papers = {};
//        page.papers.paperType = Papers.paperType;
//        page.papers.paperPublish = Papers.paperPublish;
//        page.papers.testArea = Papers.testArea;
//        TestExercisePackService.listTestPapers(function (err, list) {
//            if (err) {
//                logger.error(err);
//                res.json(500, err); //TODO response a json document with error info
//                return;
//            }
//            page.testPapers = list;
//            console.log(input);
//            res.render('tep-list', input);
//        });
//    };
//    app.get('/u2/callback', ssoLoginCallback);

//    app.get('/', dictPage);
//    app.get('/tq-index', initUser);
//    app.get('/tqt-index', initUser);
//    app.get('/tq-edit', initUser);
    //app.get('/tp-index', initUser, testPaperIndexPage);
//    app.get('/tep-list', initUser, testExercisePackList);
//    require("./design")(app);
//    require("./testQuestion")(app);
};