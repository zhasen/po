var logger = require('../commons/logging').logger;
var PageInput = require('./common/PageInput');
var util = require('util');
var ixdf = require('../services/IXDFService');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    // 取每个学员/老师的前六个班级，用于顶部公共导航条
    var getClass6 = function (req, res, next) {

        // 测试数据，勿删除，等登录页面做好并打通后再删除
        req.session.user = { id: 'xdf001000862', displayName: '李梦晗', type: 1, code: 'BJ986146', schoolid: 1 }; // 学员
        //req.session.user = { id: 'xdf00228972', displayName: '张洪伟', type: 2, code: 'BM0001', schoolid: 1 }; // 老师

        var user = PageInput.i(req).page.user;
        ixdf.class6({type: user.type, schoolid: user.schoolid, code: user.code}, function (err, class6) {
            PageInput.i(req).put('class6', class6);
            next();
        });
    };

    app.get('/schedules-stu-:tabname', getClass6, function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.user = req.session.user;
        input.tabname = req.params.tabname; // 开启哪个标签
        var search = req.query.s || ''; // 需要做安全过滤处理

        var userid = 'xdf001000862'; // 模拟数据 李梦晗 学员 // todo: 从session中取
        ixdf.userBasicData(userid, function (err, userData) {
            ixdf.uniAPIInterface({ // 根据学生编号获取班级列表
                schoolid: userData.data.SchoolId,
                studentcode: userData.data.Code,
                classcodeorname: search,
                classstatus: 3,
                pageindex: 1,
                pagesize: 9
            }, 'class', 'GetClassListFilterByStudentCode', function (err, ret) {
                // console.info(ret);
                input.classlist = ret.Data; // 班级列表数据
                input.classes = userData.class6; // layout中的班级列表
                input.userid = userid; // 用户id
                input.userType = userData.type; // 用户类型
                input.userData = userData.data; // 用户数据
                res.render('schedules-stu', input);
            })
        });
    });

    app.get('/schedules-tch-:tabname', getClass6, function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.user = req.session.user;
        input.tabname = req.params.tabname; // 开启哪个标签
        var search = req.query.s || ''; // 需要做安全过滤处理

        var userid = 'xdf00228972'; // 模拟数据 张洪伟 老师 // todo: 从session中取
        ixdf.userBasicData(userid, function (err, userData) {
            ixdf.uniAPIInterface({ // 根据教师编号获取班级列表
                schoolid: userData.data.nSchoolId,
                teachercode: userData.data.sCode,
                classcodeorname: search,
                classstatus: 3,
                pageindex: 1,
                pagesize: 9
            }, 'class', 'GetClassListFilterByTeacherCode', function (err, ret) {
                // console.info(ret);
                input.classlist = ret.Data; // 班级列表数据
                input.classes = userData.class6; // layout中的班级列表
                input.userid = userid; // 用户id
                input.userType = userData.type; // 用户类型
                input.userData = userData.data; // 用户数据
                res.render('schedules-tch', input);
            })
        });
    });

    app.get('/schedule', getClass6, function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.user = req.session.user;
        res.render('schedule', input);
    });

    app.get('/class-:schoolid-:classcode', getClass6, function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.user = req.session.user;
        input.classcode = req.params.classcode;
        input.schoolid = req.params.schoolid;
        ixdf.uniAPIInterface({ // 通过classcode调取班级信息
            schoolid: req.params.schoolid,
            classcode: req.params.classcode
        }, 'class', 'GetClassEntity', function (err, ret) {
            // console.info(ret);
            input.classData = ret.Data;
            res.render('class-page', input);
        });
    });

    /**
     * 课表获取数据的调用地址（载入课表时实时加载）
     */
    app.get('/schedule-data', function (req, res, next) {

        var userid = req.query.userid; // eg: xdf001000862
        var start = req.query.start; // eg: 2014-07-07
        var end = req.query.end; // eg: 2014-07-14

        var userType = req.query.userType; // 用户类型 学员 1 老师 2
        if (userType == 1) { // 学员参数
            var param = {
                schoolid: req.query.schoolid,
                studentCode: req.query.code,
                beginDate: start,
                endDate: end
            }
            var methodname = 'GetStudentLessonEntityList';
        } else if (userType == 2) { // 老师参数
            var param = {
                schoolid: req.query.schoolid,
                teachercode: req.query.code,
                language: 1,
                fromDay: start,
                toDay: end
            }
            var methodname = 'GetCalendarEventListOfTeacher';
        }
        //console.info('param:');
        //console.info(param);
        ixdf.uniAPIInterface(param, 'calendar', methodname, function (err, ret) {
            if (err) {
                logger.error(err);
                res.json(500, err);
                return;
            }
            //console.info('calendar:' + JSON.stringify(ret));
            //console.info(ret);
            var events = [
                {
                    id: 111,
                    title: '初中英语2600词汇精品班',
                    start: '2014-07-11T09:00:00', // todo: net时间需要转成moment时间
                    end: '2014-07-11T12:00:00'
                },
                {
                    id: 112,
                    title: '听说读写二级精华暑假走读精品小班',
                    start: '2014-07-10T14:00:00', // todo: net时间需要转成moment时间
                    end: '2014-07-10T16:00:00'
                }
            ];
            /*ret.Data.forEach(function (c) {
             events.push({
             id: c.Id, // eg: 6 ?
             title: c.ClassName, // eg: TOEFL核心词汇精讲班（限招45人）
             start: '2014-07-10T16:00:00', // todo: net时间需要转成moment时间
             end: '2014-07-11T12:30:00'
             });
             return;
             });*/
            res.json(events);
        });
    });

    /**
     * 根据整理课表数据并下载
     */
    app.get('/schedule-download', function (req, res, next) {
        res.download('public/upload/schedule/example.pdf');
    });

};