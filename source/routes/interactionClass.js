//互动课堂
var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var commonService = require('./common/commonService');
var api = require('../../settings').api;
var ixdf = require('../services/IXDFService');
var async = require('async');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    // 取每个学员/老师的前六个班级，用于顶部公共导航条
    var getMyClass = function (req, res, next) {
        var user = req.session.user;
        if(user) {
            ixdf.myClass({type: user.type, schoolid: user.schoolid, code: user.code}, function (err, myClass) {
                PageInput.i(req).put('myClass', myClass);
                next();
            });
        } else {
            res.redirect('/main-login');
        }
    };

    //获取分类的方法
    var getPtypeList = function(projectCode,callback) {
        var url = {
            "method":"getPtypeList",
            "projectCode": projectCode
        };
        var param = api.imitateExam + commonService.getUrl(url);
        commonService.request(param,function(err,data){
            if(data != undefined) {
                var data = JSON.parse(data);
            }
            callback(err,data);
        });
    };
    //查询听说读写四个不同分类的课程列表
    var getClassByType = function(type,ccode,ucode,sid,callback) {

        var url = {
            "method":"getStudentPaperListInClass",
            "ccode":ccode,
            "ucode":ucode,
            "sid":sid,
            "paperTypeId":"hdkt",
            "ptype":type
        };
        var param = api.imitateExam + commonService.getUrl(url);
        commonService.request(param,function(err,data){
            if(data != undefined) {
                var data = JSON.parse(data);
            }
            callback(err,data);
        });
    };
    //互动课堂首页
    app.get('/interaction-class-:classcode',getMyClass, function (req, res, next) {
        var classcode = req.params.classcode;
        var user = req.session.user;
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        input.classcode = classcode;
        async.series([
            function(cb) {
                getPtypeList("TOEFL",function(err,data) {
                    cb(err,data);
                });
            },
            function(cb) {
                getClassByType(1,classcode,user.code,user.schoolid,function(err,data) {
                    cb(err,data);
                });
            }

        ],
            function(err,data) {
                if (err) {
                    throw err; // TODO do more error handling
                }
                var typeList = data[0].result;
                var typeArr = [];
                for(var i=0;i<typeList.length;i++) {
                    if(i == 1) {
                        typeArr.push({"code":"1","name":"听力","ename":"listening"});
                    }else if(i == 2) {
                        typeArr.push({"code":"2","name":"口语","ename":"speaking"});
                    }else if(i == 3) {
                        typeArr.push({"code":"3","name":"阅读","ename":"reading"});
                    }else if(i == 4){
                        typeArr.push({"code":"4","name":"写作","ename":"writing"});
                    }
                }
                input.typeList = typeArr;
                input.listOne = data[1].result;
                res.render('interaction-class',input);
            }
        );
    });

    //ajax加载其他分类的课程信息
    app.post('/interaction/ajaxLoad',function(req,res) {
        var user = req.session.user;
        var type = req.body.type;
        var classcode = req.body.classcode;
        getClassByType(type,classcode,user.code,user.schoolid,function(err,data) {
            res.json(data);
        });
    });


};