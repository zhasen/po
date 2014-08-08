var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var commonService = require('./common/commonService');
var api = require('../../settings').api;
var ixdf = require('../services/IXDFService');

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
            res.redirect('/main-login');
        }
    };

    app.get('/imitateExam',getMyClass, function (req, res, next) {
        var url = {
            "method":"getStudentPaperListInClass",
            "ccode":"TF13202",
            "ucode":"BJ986146",
            "sid":1
        };

        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        var param = api.imitateExam + commonService.getUrl(url);
        commonService.request(param,function(err,data){
            var sdata = JSON.parse(data);
            input.ieData = sdata;
            console.log("sdata.result------------" +JSON.stringify(sdata.result));
            if(sdata.errno != 1){
                res.render('ie-teacher', input);
            }else{
                res.end();
            }
        });

    }); // 模考测试页

    //查看报告
    app.get('/searchTestReport',getMyClass, function (req, res, next) {
        var url = {
            "method":"getTestReportData",
            "testId":"53BF023C-69CE-4F41-84F9-AC62C5BD8AC8"
        };

        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        var param = api.imitateExam + commonService.getUrl(url);
        commonService.request(param,function(err,data){
            var sdata = JSON.parse(data);
            input.reportData = sdata;
            console.log("sdata.result------------" +JSON.stringify(sdata.result));
            if(sdata.errno != 1){
                res.render('ie-report', input);
            }else{
                res.end();
            }
        });

    });


    //试题详细
    app.get('/testQuestionDetail', function (req, res, next) {
        var url = {
            "method":"getPaperAllDataByPaperId",
            "paperId":"33818BD0-C00B-48B2-8F25-2624CFF8BC53"
        };
        var param = api.imitateExam + commonService.getUrl(url);
        commonService.request(param,function(data) {
            var data = JSON.parse(data);
            console.log("data.result------------" +JSON.stringify(data.result));
            if(data.errno != 1){
                res.render('tq-detail', {"data":data.result});
            }else{
                res.end();
            }
        });

    });

    app.get('/testQuestion', function (req, res, next) {
        var url = {
            "method":"getPaperAllDataByPaperId",
            "paperId":"33818BD0-C00B-48B2-8F25-2624CFF8BC53"
        };
        var param = api.imitateExam + commonService.getUrl(url);
        commonService.request(param,function(data) {
            var data = JSON.parse(data);
            var jsonVal = data.result.structItem.trees;

            for(var i in jsonVal){
//                console.log("i:" + i +"\t" +JSON.stringify(jsonVal[i].items));

                var flag = jsonVal[i].items;
                for(var j in flag){
                    console.log("j:" + j +"\t" +JSON.stringify(flag[j].item.subjectData));
                    var temp = flag[j].item.subjectData;
                    temp = decodeURIComponent(temp);
                    flag[j].item.subjectData = JSON.parse(temp);
                    console.log("temp----" + temp);
                }
            }
            console.log("data.result------------" +JSON.stringify(data.result));
            /*if(data.errno != 1){
                res.render('tq-detail', {"data":data.result});
            }else{
                res.end();
            }*/
        });

    });
};