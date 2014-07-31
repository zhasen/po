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
        // 测试数据，勿删除，等登录页面做好并打通后再删除
        req.session.user = { id: 'xdf001000862', displayName: '李梦晗', type: 1, code: 'BJ986146', schoolid: 1 }; // 学员
        //req.session.user = { id: 'xdf00228972', displayName: '张洪伟', type: 2, code: 'BM0001', schoolid: 1 }; // 老师

        var user = PageInput.i(req).page.user;
        ixdf.myClass({type: user.type, schoolid: user.schoolid, code: user.code}, function (err, myClass) {
            PageInput.i(req).put('myClass', myClass);
            next();
        });
    };

    /*
     判断登录的会员是否是学生 如果是学生是否绑定了学员号
     */
    var isBindStudentCode = function(req,res,next) {
        console.log('---------------->bind:');
        console.log(req.session.user);
        if(req.session.user.type == 0) {
            res.redirect('/main-bind');
        }else if(req.session.user.type == 5) {
            res.redirect('/main-bind');
        }else if(req.session.user.type == -1) {

        }
else {
            next();
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
    //查询听说读写四个不同分类的
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
    app.get('/interaction-class',getMyClass,isBindStudentCode, function (req, res, next) {
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
                console.log(input);
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