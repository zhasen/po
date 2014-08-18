var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var commonService = require('./common/commonService');
var api = require('../../settings').api;
var reportUploadPath = require('../../settings').file.report;
var ixdf = require('../services/IXDFService');
var NewsAdmin = require('../services/NewsAdminService');
var reportJson = require('../../report');
var fs = require('fs');
var showReport = require('./common/showReport');

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

    //模考列表页面
    app.get('/imitateExam-:schoolid-:classcode',getClass,getMyClass, function (req, res, next) {
        var user = req.session.user;
        var classCode = req.params.classcode;
        var schoolId = req.params.schoolid;

        var url = {
            "method":"getStudentPaperListInClass",
            "ccode":classCode,
            "ucode":user.code,
            "sid":schoolId
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
            input.classCode =classCode;
            input.schoolId =schoolId;
            res.render('ie-list', input);

        });

    });

    //模考报告
    app.get('/searchTestReport-:paperId',getMyClass, function (req, res, next) {
        var user = req.session.user;
        var userName = user.displayName;
        var finishTime = req.query.finishTime;
        var paperName = req.query.paperName;
        var paperId = req.params.paperId;
        var testId = req.query.testId;

        var data = {};
        data.paperId = req.params.paperId;
        data.testId = req.query.testId;
        data.finishTime = req.query.finishTime;
        data.paperName = req.query.paperName;
        data.userName = userName;

        showReport.showReport(req,res,data);

        /*var mtMessage ={
            "userName":userName,
            "finishTime":finishTime,
            "paperName":paperName
        };
        var url = {
            "method":"getTestReportData",
            "testId":testId
        };

        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        var param = api.imitateExam + commonService.getUrl(url);

        //统计 写作/口语 总分
        var scoreNum = 0;
        function getScoreNum(data){
            for(var i in data){
                scoreNum += parseInt(JSON.parse(data[i].correctResult).score);
            }
            return scoreNum;
        }

        //阅读真实分数
        function getReadScore(num){
            if(num>=0 && num<=9){
                return 0;
            }else if(num>10&&num<=33){
                return num-9;
            }else if(num>=34&&num<=35){
                return 25;
            }else if(num>=36&&num<=37){
                return 26;
            }else if(num>=38&&num<=39){
                return 27;
            }else if(num>=40&&num<=41){
                return 28;
            }else if(num>=42&&num<=43){
                return 29;
            }else if(num>=44&&num<=45){
                return 30;
            }
        }

        //听力真实分数
        function getListenScore(num){
            if(num<=4 && num>=0){
                return 0;
            }else{
                return num-4;
            }
        }

        commonService.request(param,function(err,data){
            var sdata = JSON.parse(data);

            if(sdata.errno != 1){
                var essayRecordList = sdata.result.essayRecordList;
                var oralRecordList = sdata.result.oralRecordList;
                //写作分数
                var essayScore = getScoreNum(essayRecordList);
                //口语分数
                scoreNum = 0;
                var oralScore = getScoreNum(oralRecordList);
                var items = sdata.result.testResultDetailList;
                //听力分数
                var listenScore = 0;
                //阅读分数
                var readScore = 0;
                var itemLength = 0;

                //综合写作
                var integratedWriting = 0;
                //独立写作
                var independentWriting = 0;
                //学术课堂
                var scholarshipClass = 0;
                //校园对话
                var campusDialogue = 0;
                //独立任务
                var independentTask = 0;
                var detail ={};

                for(var i in essayRecordList){
                    if(i==0){
                        //综合写作
                        detail.integratedWriting = parseInt(JSON.parse(essayRecordList[i].correctResult).score);
                    }else if(i==1){
                        //独立写作
                        detail.independentWriting = parseInt(JSON.parse(essayRecordList[i].correctResult).score);
                    }
                }

                for(var i in oralRecordList){
                    if(i==0){
                        //独立任务
                        detail.independentTask = parseInt(JSON.parse(oralRecordList[i].correctResult).score);
                    }else if(i==1){
                        //校园对话
                        detail.campusDialogue = parseInt(JSON.parse(oralRecordList[i].correctResult).score);
                    }else if(i==2){
                        //学术课堂
                        detail.scholarshipClass = parseInt(JSON.parse(oralRecordList[i].correctResult).score);
                    }

                }

                commonService.getPaperItems(paperId,function(result){
                    for(var i in items){
                        itemLength++;
                        var subjectId = items[i].subjectId;
                        var subjectMark = items[i].subjectMark;
                        for(var j in result){
                            if(subjectId == j && result[j].subjectType == 'TOEFL_LISTEN'){
                                listenScore += subjectMark;
                            }else if(subjectId == j && result[j].subjectType == 'TOEFL_READ'){
                                readScore += subjectMark;
                            }
                        }

                        if(itemLength == items.length){
                            readScore = getReadScore(readScore);
                            listenScore = getListenScore(listenScore);
                            var totalScore = essayScore+oralScore+listenScore+readScore;
                            var mtScore ={
                                "essayScore":essayScore,
                                "oralScore":oralScore,
                                "listenScore":listenScore,
                                "readScore":readScore,
                                "totalScore":totalScore
                            };
                            res.render('ie-report', {reportData:sdata,data:mtScore,mtMessage:mtMessage,detail:detail,reportJson:reportJson.content});
                        }

                    }

                });
            }else{
                console.log("获取报告出错");
                res.render('ie-report',input);
            }
        });*/

    });

    //下载报告
    app.get('/downloadreport-:paperId',getMyClass, function (req, res, next) {
        var NodePDF = require('nodepdf');

        var user = req.session.user;
        var userName = user.displayName;
        var finishTime = req.query.finishTime;
        var paperName = req.query.paperName;
        var testId = req.query.testId;
        var paperId = req.params.paperId;

        //var url = "http://path.staff.xdf.cn/searchTestReport-"+paperId+"?testId="+testId+"&finishTime="+finishTime+"&paperName="+paperName;
        var url = "http://127.0.0.1:3010/showReport-"+paperId+"?testId="+testId+"&finishTime="+finishTime+"&paperName="+paperName+"&userName="+userName;

        console.log(url);

        var pdfName = testId+".pdf";

        var pdfPath = reportUploadPath +"/" + pdfName;

        fs.exists(pdfPath, function(exists){
            if(exists){
                res.download(pdfPath);
            }else{
                var pdf = new NodePDF(url, pdfPath, {


                 });

                 pdf.on('error', function(msg){
                 console.log(msg);
                 });

                 pdf.on('done', function(pathToFile){
                 res.download(pathToFile);
                 console.log(pathToFile);
                 });

                 // listen for stdout from phantomjs
                 pdf.on('stdout', function(stdout){
                 // handle
                 });

                 // listen for stderr from phantomjs
                 pdf.on('stderr', function(stderr){
                 // handle
                 });
            }
        });

    });

};

