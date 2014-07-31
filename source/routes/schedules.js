var logger = require('../commons/logging').logger;
var PageInput = require('./common/PageInput');
var util = require('util');
var time = require('../../source/commons/time');
var ixdf = require('../services/IXDFService');
var pdf = require('../services/PDFService');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    // 取每个学员/老师的前六个班级，用于顶部公共导航条
    var getMyClass = function (req, res, next) {
        // 测试数据，勿删除，等登录页面做好并打通后再删除
        //req.session.user = { id: 'xdf001000862', displayName: '李梦晗', type: 1, code: 'BJ986146', schoolid: 1 }; // 学员
        //req.session.user = { id: 'xdf00228972', displayName: '张洪伟', type: 2, code: 'BM0001', schoolid: 1 }; // 老师

        var user = PageInput.i(req).page.user;
        ixdf.myClass({type: user.type, schoolid: user.schoolid, code: user.code}, function (err, myClass) {
            PageInput.i(req).put('myClass', myClass);
            next();
        });
    };

    // 获取每个学员/老师的全部班级，用于班级下拉框
    var getAllClass = function (req, res, next) {
        var input = PageInput.i(req);
        // 根据学生/老师Code获取全部班级列表
        var param = {classcodeorname: '', classstatus: 3, pageindex: 1, pagesize: 9999};
        ixdf.classList(param, input.page.user, function (err, data) {
            // console.info(data);
            PageInput.i(req).put('myAllClass', data); // 班级全部列表数据
            next();
        });
    }

    // 通过班级号获取班级数据
    var getClass = function (req, res, next) {
        var input = PageInput.i(req);
        input.classcode = req.params.classcode;
        input.schoolid = req.params.schoolid;
        // 通过 classcode 调取班级信息
        var param = {schoolid: req.params.schoolid, classcode: req.params.classcode};
        ixdf.classEntity(param, function (err, classData) {
            //console.info(classData);
            PageInput.i(req).put('classData', classData); // 班级全部列表数据
            next();
        });
    }

    // 学生/老师-所有班级、所有课表页面
    app.get('/schedules-:tabname-:page', getMyClass, getAllClass, function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.tabname = req.params.tabname; // 开启哪个标签
        input.searchkey = '';
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';

        // 根据学生编号获取班级列表，有分页
        var param = {classcodeorname: input.searchkey, classstatus: 3, pageindex: req.params.page, pagesize: 9};
        ixdf.classList(param, input.page.user, function (err, data) {
            // console.info(ret);
            input.classlist = data; // 班级列表数据
            res.render('schedules-' + input.token, input);
        });
    });

    // 班级主页-首页
    app.get('/class-:schoolid-:classcode', getMyClass, getClass, function (req, res, next) {
        asseton(req, res);
        //console.log(req.session);
        var input = PageInput.i(req);
        res.render('class-page', input);
    });

    /**
     * 班级主页-课表页
     */
    app.get('/schedule-:schoolid-:classcode', getMyClass, getClass, function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        res.render('schedule', input);
    });

    /**
     * 异步获取课表数据
     */
    app.get('/classlist-data', function (req, res, next) {
        var user = {type: req.query.type, schoolid: req.query.schoolid, code: req.query.code};
        var param = {classcodeorname: req.query.class_key, classstatus: 3, pageindex: 1, pagesize: 99};
        ixdf.classList(param, user, function (err, data) {
            res.json(data);
        });
    });

    /**
     * 课表获取数据的调用地址（载入课表时实时加载）
     */
    app.get('/schedule-data', function (req, res, next) {
        var param = {
            userid: req.query.userid, // eg: xdf001000862
            start: req.query.start, // eg: 2014-07-07
            end: req.query.end, // eg: 2014-07-14
            userType: req.query.userType, // 用户类型 学员 1 老师 2
            schoolid: req.query.schoolid, // 用户所在学校
            code: req.query.code // 学生code、老师code
        };
        ixdf.scheduleList(param, function (err, events) {
            if (err) {
                logger.error(err);
                res.json(500, err);
            }
            res.json(events);
        });
    });

    /**
     * 下载课程表
     */
    app.get('/scheduledl-:schoolid-:classcode', getClass, function (req, res, next) {
        var input = PageInput.i(req);
        //console.info('scheduledl:' + JSON.stringify({classcode: input.classcode, schoolid: input.schoolid }));
        ixdf.scheduleOfClass({classcode: input.classcode, schoolid: input.schoolid }, function (err, events) {
            var filename = 'schedule-' + input.schoolid + '-' + input.classcode;
            pdf.generatePDF(filename, events, input.page.classData, function (err, filename) {
                res.download(filename);
            });
        });
    });

    /**
     * 下载课程表之后删除pdf文件 // todo: 下载课程表之后删除pdf文件
     */
};