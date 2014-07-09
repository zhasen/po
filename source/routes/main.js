var logger = require('../commons/logging').logger;
var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var util = require('util');
var DictService = require('../services/DictService');
var ixdf = require('../../source/services/IXDFService');
var time = require('../../source/commons/time');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    auth.bind(app);//use all authentication routing and handlers binding here

    var indexPage = function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i();
        input.user = {};
        //var userid = 'xdf00228972'; // 模拟数据1 张洪伟 老师
        var userid = 'xdf001000862'; // 模拟数据2 李梦晗 学员
        ixdf.uniAPIInterface({userid: userid}, 'user', 'GetUserTypeByUserId', function (err, ret) { // 获取用户身份
            var userType = ret.Data.Type; // 用户类型：老师2 ？学生1 ？
            if (userType == 2) {
                var controlername = 'teacher';
                var methodname = 'GetTeacherByUserId';
            } else {
                var controlername = 'student';
                var methodname = 'GetDefaultStudentByUserId';
            }
            ixdf.uniAPIInterface({userid: userid}, controlername, methodname, function (err, ret) { // 获取用户数据
                app.set('userData', {type: userType, data: ret.Data});
                var userData = app.get('userData');
                //console.info(userData);
                // 获取前六个班级
                var param = {classcodeorname: '', classstatus: 3, pageindex: 1, pagesize: 6};
                var controllername = 'class';
                var methodname = '', viewname = '', token = '';
                if (userData.type == 2) {
                    param.schoolid = userData.data.nSchoolId;
                    param.teachercode = userData.data.sCode;
                    methodname = 'GetClassListFilterByTeacherCode';
                    viewname = 'index_tch';
                    token = 'tch';
                } else {
                    param.schoolid = userData.data.SchoolId;
                    param.studentcode = userData.data.Code;
                    methodname = 'GetClassListFilterByStudentCode';
                    viewname = 'index_stu';
                    token = 'stu';
                }
                //console .info(param);
                ixdf.uniAPIInterface(param, controllername, methodname, function (err, ret) {
                    console.info(ret)
                    ret.Data.forEach(function (clas) {
                        clas.poBeginDate = time.format(time.netToDate(clas.BeginDate), 'yyyy.MM.dd')
                        clas.poEndDate = time.format(time.netToDate(clas.EndDate), 'yyyy.MM.dd')
                    });
                    input.classes = ret.Data;
                    input.token = token;
                    res.render(viewname, input);
                })
            });
        });

    };
    app.get('/', indexPage);

    app.get('/test', function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i();
        input.user = req.session.user;
        res.render('test', input);
    });

};