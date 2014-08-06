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
    var getClassByType = function(type,callback) {

        var url = {
            "method":"getStudentPaperListInClass",
            "ccode":"TF13202",
            "ucode":"BJ986146",
            "sid":1,
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
        console.log('---------->user:');
        console.log(user);
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        async.series([
            function(cb) {
                getPtypeList("TOEFL",function(err,data) {
                    cb(err,data);
                });
            },
            function(cb) {
                getClassByType(1,function(err,data) {
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
//                        typeList[i]['ename'] = "listening";
//                        typeList[i]['name'] = "听力";
                    }else if(i == 2) {
                        typeArr.push({"code":"2","name":"口语","ename":"speaking"});
//                        typeList[i]['ename'] = "speaking";
//                        typeList[i]['name'] = "口语";
                    }else if(i == 3) {
                        typeArr.push({"code":"3","name":"阅读","ename":"reading"});
//                        typeList[i]['ename'] = "reading";
//                        typeList[i]['name'] = "阅读";
                    }else if(i == 4){
                        typeArr.push({"code":"4","name":"写作","ename":"writing"});
//                        typeList[i]['ename'] = "writing";
//                        typeList[i]['name'] = "写作";
                    }
                }
                input.typeList = typeArr;
                input.listOne = data[1].result;
                //console.log(input);
                res.render('interaction-class',input);
            }
        );
    });

    //ajax加载其他分类的课程信息
    app.post('/interaction/ajaxLoad',function(req,res) {
        var type = req.body.type;
        getClassByType(type,function(err,data) {
            res.json(data);
        });
    });


};