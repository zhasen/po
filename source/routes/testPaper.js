var logger = require('../commons/logging').logger;
var util = require('util');
var time = require('../commons/time');
var TestPapersService = require('../services/TestPapersService');
var TestPaper = require('../models/TestPaper').model;
var typeRegistry = require('../models/TypeRegistry');
var PageInput = require('./common/PageInput');



module.exports = function(app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    //加载用户信息
    var initUser = function(req, res, next) {
        req.user = {};//TODO: impl it later soon
        next();
    };

    //为试卷列表查询数据并传输到模板
    var testPaperIndexPage = function(req, res, next) {
        asseton(req, res);
        var input = PageInput.i().enums(['TestPaperType','erPublishStatus','Region','erPublishAction']);
        //var input = PageInput.i().enums();
        TestPapersService.listTestPapers(function(err, list ){
            input.page.list = list;
            console.log(input);
            //转化时间格式
            var len = list.length;
            for(var i=0; i<len; i++){
                var item = list[i];
                item.crtOn = item.crtOn.format();
                item.updOn = item.updOn.format();
            }

            res.render('tp-index', input);
        });
    };
    app.get('/tp-index',initUser,testPaperIndexPage);

    //添加页面
    var editPage1 = function(req, res, next) {
        asseton(req, res);
        var input = PageInput.i().enums(['TestPaperType','erPublishStatus','Region','erPublishAction']);
//        var input = {};
//        var page = {};
//        input.page = page;
//        page.user = req.user;
//        page.papers = {};
//        page.papers.paperType = typeRegistry.TestPaperType.data();
//        page.papers.testArea = typeRegistry.Region.data();
        input.page.year = time.currentYear();
        input.page.years = time.recentYears(3);
        console.log(input);
        res.render('tp-edit-1',input);
    };
    app.get('/tp-edit',editPage1);

    //执行插入过程
    var addBasicInfo = function(req,res,next) {
        asseton(req, res);
        TestPapersService.insert(req.body,function(err,model){
            console.log(req.body);
            if (err) {
                console.err('save error'); // TODO: 页面弹出提示窗，不跳转页面
            } else {
                //results
                res.redirect('/tp-edit-'+model.get('id'));
            }
        });
    }
    app.post('/tp-edit',addBasicInfo);

    //编辑页面
//    var editPage2 = function(req, res) {
//        asseton(req, res);
//        TestPapersService.getById(req.params.id,function(err,data){
//            //console.log(req.params.id);
//            console.info(data);
//            var input = {};
//            var page = {};
//            input.page = page;
//            input.item = data;
//            page.user = req.user;
//            page.papers = {};
//            page.papers.paperType = typeRegistry.TestPaperType.data();
//            page.papers.testArea = typeRegistry.Region.data();
//            page.papers.years = time.recentYears(3);
//            res.render('tp-edit-2',input);
//        });
//    }
//    app.get('/tp-edit-:id',editPage2);

    var editPage = function(req, res) {
        asseton(req, res);
        var input = PageInput.i().enums();
        input.page.years = time.recentYears(3);
        res.render('tp-edit',input);
    }
    app.get('/tp-edit-:id',editPage);


    //编辑功能
    var testPaperEdit = function(req, res) {
        asseton(req, res);
        TestPapersService.update(req.params.id,req.body,function(err,model) {
            console.log(req.body);
            if (err) {
                console.err('update error'); // TODO: 页面弹出提示窗
            } else {
                console.info(model.get('id'), ' ', model.json());
                res.redirect('/tp-edit-' + model.get('id'));
            }
        });
    }
    app.post('/tp-edit-:id',testPaperEdit);

    //发布
    var testPaperPulish = function(req, res, next) {
        asseton(req, res);
//        console.log(req);
        TestPapersService.publishPaper(req.params.id,req.params.paperPublish,function(err,data){
            if(data){
                res.redirect('/tp-index');
            }
        });
    }

    var singleAttrAction = function (req, res, next) {
        var tpId = req.params.id;
        var action = req.params.action;
        //logger.debug(util.format('User [%s] %ss thing [%s]', uid, action, thingId));
        TestPapersService[action](tpId, function (err, result) {
            if (err) {
                logger.error(err);
                res.json(500, {status: 'error', result: '操作失败，错误信息：' + err});
                return;
            }
            /* result._data.erPublishStatus = typeRegistry.erPublishStatus.data().map[result._data.erPublish];
             result._data.erPublishAction = typeRegistry.erPublishAction.data().map[result._data.erPublish];
             result._data.erAuditStatus = typeRegistry.erAuditStatus.data().map[result._data.erAudit];
             result._data.erAuditAction = typeRegistry.erAuditAction.data().map[result._data.erAudit];*/
            res.json(200, {status: 'success', result: result});
        });
    };
    app.put('/tp/:id/:action', singleAttrAction); // 修改试卷的发布状态等单一属性

    app.get('/tp-publish-:id-:paperPublish',testPaperPulish,testPaperIndexPage);

    //删除
    var testPaperDel = function(req, res) {
        asseton(req, res);
        TestPapersService.deletePaper(req.params.id,function(err){
            if (err) {
                logger.error(err);
                res.json(500, {status: 'error', result: '删除失败, 错误信息：' + err});
            } else {
                res.json(200, {status: 'success', result: '删除成功'});
            }
        });
    };
    //app.get('/tp-del-:id', testPaperDel);
    app.delete('/tp/:id', testPaperDel);

    //复制
    var testPaperCopy = function(req, res) {
        asseton(req, res);
        TestPapersService.copyPaper(req.body.pid,req.body,function(err, model) {
            if(err){

            }
            res.json(model);
        })
    }
    app.post('/tp-copy',testPaperCopy);

    app.get('/tp/:id', function(req, res, next){
        var id = req.params.id;
        TestPapersService.getById(id, function(err, json){
            if(err){
                throw err; //TODO:
            }
            res.json(200, json);
        });
    });



};