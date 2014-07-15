var logger = require('../commons/logging').logger;
var PageInput = require('./common/PageInput');
var util = require('util');
var time = require('../../source/commons/time');
var ixdf = require('../services/IXDFService');
var PDFDocument = require('pdfkit');
var fs = require('fs');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    // 取每个学员/老师的前六个班级，用于顶部公共导航条
    var getMyClass = function (req, res, next) {
        // 测试数据，勿删除，等登录页面做好并打通后再删除
        req.session.user = { id: 'xdf001000862', displayName: '李梦晗', type: 1, code: 'BJ986146', schoolid: 1 }; // 学员
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
            // console.info(ret);
            PageInput.i(req).put('myAllClass', data); // 班级全部列表数据
            next();
        });
    }

    // 学生-所有班级、所有课表页面
    app.get('/schedules-stu-:tabname-:page', getMyClass, getAllClass, function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.tabname = req.params.tabname; // 开启哪个标签
        input.searchkey = req.query.s || ''; // todo: 需要做安全过滤处理

        // 根据学生编号获取班级列表，有分页
        var param = {classcodeorname: input.searchkey, classstatus: 3, pageindex: req.params.page, pagesize: 9};
        ixdf.classList(param, input.page.user, function (err, data) {
            // console.info(ret);
            input.classlist = data; // 班级列表数据
            res.render('schedules-stu', input);
        });
    });

    // 老师-所有班级、所有课表页面，有分页
    app.get('/schedules-tch-:tabname-:page', getMyClass, getAllClass, function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.tabname = req.params.tabname; // 开启哪个标签
        input.searchkey = req.query.s || ''; // todo: 需要做安全过滤处理

        // 根据教师编号获取班级列表
        var param = {classcodeorname: input.searchkey, classstatus: 3, pageindex: req.params.page, pagesize: 9};
        ixdf.classList(param, input.page.user, function (err, data) {
            // console.info(ret);
            input.classlist = data; // 班级列表数据
            res.render('schedules-tch', input);
        });
    });

    // 班级主页-首页
    app.get('/class-:schoolid-:classcode', getMyClass, function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classcode = req.params.classcode;
        input.schoolid = req.params.schoolid;
        // 通过classcode调取班级信息
        var param = {schoolid: req.params.schoolid, classcode: req.params.classcode};
        ixdf.uniAPIInterface(param, 'class', 'GetClassEntity', function (err, ret) {
            // console.info(ret);
            var classData = ret.Data;
            classData.poBeginDate = time.format(time.netToDate(classData.BeginDate), 'yyyy.MM.dd');
            classData.poEndDate = time.format(time.netToDate(classData.EndDate), 'yyyy.MM.dd');
            input.classData = classData;
            res.render('class-page', input);
        });
    });

    // 班级主页-课表页
    app.get('/schedule', getMyClass, getAllClass, function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        res.render('schedule', input);
    });

    /**
     * 课表获取数据的调用地址（载入课表时实时加载）
     */
    app.get('/schedule-data', function (req, res, next) {
        var userid = req.query.userid; // eg: xdf001000862
        var start = req.query.start; // eg: 2014-07-07
        var end = req.query.end; // eg: 2014-07-14
        var userType = req.query.userType; // 用户类型 学员 1 老师 2

        var param = {}, methodname = '';
        if (userType == 1) { // 学员参数
            param = {
                schoolid: req.query.schoolid,
                studentCode: req.query.code,
                beginDate: start,
                endDate: end
            }
            methodname = 'GetStudentLessonEntityList';
        } else if (userType == 2) { // 老师参数
            param = {
                schoolid: req.query.schoolid,
                teachercode: req.query.code,
                language: 1,
                fromDay: start,
                toDay: end
            }
            methodname = 'GetCalendarEventListOfTeacher';
        }
        console.info('param:' + JSON.stringify(param));
        ixdf.uniAPIInterface(param, 'calendar', methodname, function (err, ret) {
            if (err) {
                logger.error(err);
                res.json(500, err);
                return;
            }
//            console.info('calendar:' + JSON.stringify(ret.Data));
//            console.info(ret.Data.length);
            var events = [];
            ret.Data.forEach(function (c) {
                // console.info(c);
                events.push({
                    id: c.Id, // eg: 60324222
                    title: c.ClassName, // eg: TOEFL核心词汇精讲班（限招45人）
                    start: c.BeginDate, // eg: 2013-01-23 00:00:00
                    end: c.EndDate // eg: 2013-01-23 00:00:00
                });
            });
//            console.info('schedule-data: ');
//            console.info('schedule-data-event:');
//            console.info(events);
            res.json(events);
        });
    });

    /**
     * 根据整理课表数据并下载
     */
    var generatePDF = function (req, res, next) {
        var doc = new PDFDocument;
        doc.pipe(fs.createWriteStream('public/upload/schedule/output.pdf')); // todo: 下载后需要删掉
        // doc.pipe(res); // 把流输出到应答
        doc.fontSize(25).text('Some text with an embedded font!', 100, 100);
        doc.addPage()
            .fontSize(25)
            .text('Here is some vector graphics...', 100, 100);
        doc.save()
            .moveTo(100, 150)
            .lineTo(100, 250)
            .lineTo(200, 250)
            .fill("#FF3300");
        doc.scale(0.6)
            .translate(470, -380)
            .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
            .fill('red', 'even-odd')
            .restore();
        doc.addPage()
            .fillColor("blue")
            .text('Here is a link!', 100, 100)
            .underline(100, 100, 160, 27, {color: "#0000FF"})
            .link(100, 100, 160, 27, 'http://google.com/');
        doc.end();
        next();
    };

    app.get('/schedule-download', generatePDF, function (req, res, next) {
        setTimeout(function () {
            res.download('public/upload/schedule/output.pdf'); // todo: 以后用流控制实现
        }, 1000);
    });

};