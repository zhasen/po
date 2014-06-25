var logger = require('../commons/logging').logger;
var util = require('util');
var DictService = require('../services/DictService');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    var indexPage = function (req, res, next) {
        asseton(req, res);
        var input = {};
        var user = req.user;
        if (req.user.isNew) {
            input.user = user;
            res.render('layout', input);
        }
        else {
            var uid = req.user.id;
            UserService.loadMeta(uid, function (err, meta) {
                user.meta = meta;
                input.user = user;
                res.render('dict', input);
            })
        }
    };
    var dictPage = function (req, res, next) {
        asseton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        var user = req.user;
        page.user = user;
        page.targets = [];
        console.log(input);
        res.render('dict', input);
//        DictService.listTargets(function(err, targets ){
//            page.targets = targets;
//            console.error(input);
//            console.log(input);
//            res.render('dict', input);
//        });
    };

    var initUser = function (req, res, next) {
        req.user = {};//TODO: impl it later soon
        next();
    };

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


    //练习包列表查询数据并传输到模板
    /*var ssoLoginCallback = function (req, res, next) {
        asseton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        page.user = req.user;
        page.papers = {};
        page.papers.paperType = Papers.paperType;
        page.papers.paperPublish = Papers.paperPublish;
        page.papers.testArea = Papers.testArea;
        TestExercisePackService.listTestPapers(function (err, list) {
            if (err) {
                logger.error(err);
                res.json(500, err); //TODO response a json document with error info
                return;
            }
            page.testPapers = list;
            console.log(input);
            res.render('tep-list', input);
        });
    };*/
    //app.get('/u2/callback', ssoLoginCallback);

    app.get('/', dictPage);
    app.get('/tq-index', initUser);
    app.get('/tqt-index', initUser);
    app.get('/tq-edit', initUser);

//    require("./design")(app);
    require("./testQuestion")(app);
};