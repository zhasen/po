var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var commonService = require('./common/commonService');
var api = require('../../settings').api;
var ixdf = require('../services/IXDFService');
var NewsAdmin = require('../services/NewsAdminService');

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

    //模考列表页面
    app.get('/imitateExam-:classcode',getMyClass, function (req, res, next) {
        var user = req.session.user;
        var classcode = req.params.classcode;
        var classname = req.query.classname;
        var poBeginDate = req.query.poBeginDate;
        var poEndDate = req.query.poEndDate;
        var classStatus = req.query.classStatus;

        /*var url = {
            "method":"getStudentPaperListInClass",
            "ccode":"TF13202",
            "ucode":"BJ986146",
            "sid":1
        };*/
        var url = {
            "method":"getStudentPaperListInClass",
            "ccode":classcode,
            "ucode":user.code,
            "sid":user.schoolid
        };

        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        var param = api.imitateExam + commonService.getUrl(url);
        commonService.request(param,function(err,data){
            var sdata = JSON.parse(data);
            /*var sdata ={
                "errno": 0,
                "result": [
                    {
                        "allotID": "7f032df1-d2f5-44b0-af34-6cf2b4f011b1",
                        "answerid": "D33CE0FA-3DB6-4E63-BA12-FC689A2F1979",
                        "correctStatus": 0,
                        "flagFinish": -1,
                        "paperId": "33818BD0-C00B-48B2-8F25-2624CFF8BC53",
                        "paperName": "mini-TPO9-模拟",
                        "paperTypeId": "tpo"
                    },
                    {
                        "allotID": "81aed961-0efd-4cf8-9e88-b9a9531048eb",
                        "correctStatus": 0,
                        "flagFinish": 0,
                        "paperId": "26A6750C-374A-4843-954C-809EA29906DC",
                        "paperName": "XH_BJ_TPO11_20140317",
                        "paperTypeId": "hdkt"
                    },
                    {
                        "allotID": "167b6a3b-1b53-4e69-ac21-ed9149221ac1",
                        "correctStatus": 0,
                        "flagFinish": 1,
                        "paperId": "7178CE36-E114-45C4-8A91-60893744D81B",
                        "paperName": "XH_TPO11_TPO_LOAD",
                        "paperTypeId": "hdkt"
                    },
                    {
                        "allotID": "167b6a3b-1b53-4e69-ac21-ed9149221ac1",
                        "correctStatus": 1,
                        "flagFinish": 1,
                        "paperId": "7178CE36-E114-45C4-8A91-60893744D81B",
                        "paperName": "XH_TPO11_TPO_LOAD",
                        "paperTypeId": "hdkt"
                    },
                    {
                        "allotID": "91af5209-1ee6-4e78-9672-05b84ff78bef",
                        "answerid": "1C50E557-BA57-454B-A322-89EA28A015AB",
                        "correctStatus": 2,
                        "finishTime": "2014-07-24 11:56:197",
                        "flagFinish": 1,
                        "paperId": "24C89AB5-F2D5-404D-B8D0-9130EA6441FF",
                        "paperName": "mini-TPO17-模拟",
                        "paperTypeId": "tpo"
                    }
                ]
            };*/
            input.ieData = sdata;
            input.classcode =classcode;
            input.classname =classname;
            input.poBeginDate =poBeginDate;
            input.poEndDate =poEndDate;
            input.classStatus =classStatus;


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

        var mtMessage ={
            "userName":userName,
            "finishTime":finishTime,
            "paperName":paperName
        };
        /*var url = {
            "method":"getTestReportData",
            "testId":"53BF023C-69CE-4F41-84F9-AC62C5BD8AC8"
        };*/
        var url = {
            "method":"getTestReportData",
            "testId":paperId
        };

        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        var param = api.imitateExam + commonService.getUrl(url);

        var scoreNum = 0;
        function getScoreNum(data){
            for(var i in data){
                scoreNum += parseInt(JSON.parse(data[i].correctResult).score);
            }
            return scoreNum;
        }

        commonService.request(param,function(err,data){
            var sdata = JSON.parse(data);

            input.reportData = sdata;

            if(sdata.errno != 1){
                //写作分数
                var essayScore = getScoreNum(sdata.result.essayRecordList);
                //口语分数
                scoreNum = 0;
                var oralScore = getScoreNum(sdata.result.oralRecordList);
                var items = sdata.result.testResultDetailList;
                //听力分数
                var listenScore = 0;
                //阅读分数
                var readScore = 0;
                var itemLength = 0;

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
                            var totalScore = essayScore+oralScore+listenScore+readScore;
                            var mtScore ={
                                "essayScore":essayScore,
                                "oralScore":oralScore,
                                "listenScore":listenScore,
                                "readScore":readScore,
                                "totalScore":totalScore
                            };
                            res.render('ie-report', {input:input,data:mtScore,mtMessage:mtMessage});
                        }

                    }

                });
            }else{
                console.log("获取报告出错");
                res.render('ie-report',input);
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

