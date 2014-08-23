var logger = require('../commons/logging').logger;
var PageInput = require('./common/PageInput');
var util = require('util');
var time = require('../../source/commons/time');
var ixdf = require('../services/IXDFService');
var pdf = require('../services/PDFService');
var NewsAdmin = require('../services/NewsAdminService');
var commonShow = require('./common/commonShow');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    // 取每个学员/老师的前六个班级，用于顶部公共导航条
    var getMyClass = function (req, res, next) {

        var user = req.session.user;

        console.log('/getMyClass:  user');
        console.log(user);

        if(user) {
            ixdf.myClass({type: user.type, schoolid: user.schoolid, code: user.code}, function (err, myClass) {
                PageInput.i(req).put('myClass', myClass);
                if(user.type == 1 || user.type == 9) {
                    var type = 1;
                }else if(user.type == 2 || user.type == 22) {
                    var type = 2;
                }else {
                    var type = 5;
                }
                NewsAdmin.listAllNews(type,function(err,msglist) {
                    if(err) {
                        logger.log(err);
                    }
                    var msg_no_read = [];
                    if(msglist) {
                        for(var i=0;i<msglist.length;i++) {
                            if(msglist[i].is_delete.indexOf(user.id) == -1 && msglist[i].is_read.indexOf(user.id) == -1) {
                                msg_no_read[i] = msglist[i];
                            }
                        }
                        var num_no_read = msg_no_read.length;
                    }else {
                        var num_no_read = 0;
                    }
                    PageInput.i(req).put('num_no_read',num_no_read);
                    PageInput.i(req).put('msglist',msglist);
                    next();
                });
            });
        } else {
            res.redirect('/main');
        }
    };

    // 获取每个学员/老师的全部班级，用于班级下拉框
    var getAllClass = function (req, res, next) {
        var input = PageInput.i(req);
        // 根据学生/老师Code获取全部班级列表
        var param = {classcodeorname: '', classstatus: 3, pageindex: 1, pagesize: 10};
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
        /* console.log(input.page.user);
         { id: 'xdf00205858',
         displayName: '滕达',
         email: 'tengda@xdf.cn',
         type: 2,
         code: 'BM0267',
         schoolid: 1 } */
         ixdf.classList(param, input.page.user, function (err, data) {
            input.classlist = data; // 班级列表数据
            res.render('schedules-' + input.token, input);
        });
    });

    // 班级主页-首页
    app.get('/class-:schoolid-:classcode', getMyClass, getClass, function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        //判断是否显示模考
        commonShow.showImitateExam(req.params.classcode,function(flag) {
            input.showImitateExam = flag;
            //判断是否显示互动课堂
            commonShow.showInteractionClass(req.params.classcode,function(flagIn) {
                input.showInteractionClass = flagIn;
                res.render('class-page', input);
            });
        });

    });

    /**
     * 班级主页-课表页
     */
    app.get('/schedule-:schoolid-:classcode', getMyClass, getClass, function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        //判断是否显示模考
        commonShow.showImitateExam(req.params.classcode,function(flag) {
            input.showImitateExam = flag;
            //判断是否显示互动课堂
            commonShow.showInteractionClass(req.params.classcode,function(flagIn) {
                input.showInteractionClass = flagIn;
                res.render('schedule', input);
            });
        });
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
            console.log('events:');
            console.log(events);
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