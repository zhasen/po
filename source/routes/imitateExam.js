var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var commonService = require('./common/commonService');
var settings = require('../../settings');
var reportUploadPath = require('../../settings').file.report;
var ixdf = require('../services/IXDFService');
var NewsAdmin = require('../services/NewsAdminService');
var fs = require('fs');
var showReport = require('./common/showReport');
var commonShow = require('./common/commonShow');

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
            "sid":schoolId,
            "paperTypeId":"tpo"
        };

        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        var param = settings.oms.omsUrl +"?"+ commonService.getUrl(url);
        commonService.request(param,function(err,data){
            var sdata = JSON.parse(data);

            commonShow.showInteractionClass(classCode,function(flag) {
                input.showInteractionClass = flag;
                input.ieData = sdata;
                input.classCode =classCode;
                input.schoolId =schoolId;
                res.render('ie-list', input);
            });
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

        var urlData={
            "testId":testId,
            "finishTime":finishTime,
            "paperName":paperName,
            "userName":userName
        }

        var url = "http://127.0.0.1:"+ settings.app.port+ "/showReport-"+paperId+"?"+ commonService.getUrl(urlData);
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

