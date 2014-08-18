//互动课堂
var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var commonService = require('./common/commonService');
var api = require('../../settings').api;
var ixdf = require('../services/IXDFService');
var NewsAdmin = require('../services/NewsAdminService');
var InteractiveClassroomDetailService = require('../services/InteractiveClassroomDetailService');
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
        input.shcoolid = input.user.schoolid;

        //获取答题记录列表条件
        var whereObject = {
            'classCode': classcode,
            'userId': req.session.user.id,
            'pType': 1
        };

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
            },
            function(cb) {
                InteractiveClassroomDetailService.findTestRecord(whereObject,function(err,data) {
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
                input.listOneAnwser = data[2].result;

                res.render('interaction-class',input);
            }
        );
    });

    //ajax加载课程信息
    app.post('/interaction/ajaxLoad',function(req,res) {
        var user = req.session.user;
        var type = req.body.type;
        var classcode = req.body.classcode;
        getClassByType(type,classcode,user.code,user.schoolid,function(err,data) {
            res.json(data);
        });
    });

    //ajax加载答题记录信息
    app.post('/interaction/ajaxLoadAnswer',function(req,res) {
        var user = req.session.user;
        var type = req.body.type;
        var classcode = req.body.classcode;
        //获取答题记录列表条件
        var whereObject = {
            'classCode': classcode,
            'userId': user.id,
            'pType': type
        };
        InteractiveClassroomDetailService.findTestRecord(whereObject,function(err,data) {
            res.json(data);
        });
    });


};