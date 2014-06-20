var logger = require('../commons/logging').logger;
var util = require('util');
var time = require('../commons/time');
var TestPackageService = require('../services/TestPackageService');

module.exports = function(app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);
    //加载用户信息
    var initUser = function(req, res, next) {
        req.user = {};//TODO: impl it later soon
        next();
    };
    //试题包列表
    var testPackageIndex = function (req,res,next){
        asseton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        page.user = req.user;
        TestPackageService.listAll(function(err,dataItem){
            input.list = dataItem ;
            res.render('tpk-index', input);
        })
    }
    app.get('/tpk-index',initUser,testPackageIndex);

    var testPackageToEdit = function (req,res,next){
        asseton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        page.user = req.user;
        var id = req.params.id ;
        if(!id){
            var info = {} ;
            info.id='';
            info.name='';
            info.remark = '' ;
            input.info = info ;
            res.render('tpk-edit', input);
        }else{
            TestPackageService.loadById(id,function(err,data){
                input.info = data ;
                res.render('tpk-edit', input);
            });
        }
    }
    app.get('/tpk-to-save',initUser,testPackageToEdit);
    app.get('/tpk-to-save:id',initUser,testPackageToEdit);

    var testPackageSave = function (req,res,next){
        asseton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        page.user = req.user;
        var infoSave = req.body ;
        if(!infoSave.id){
            TestPackageService.insert(infoSave,function(err,data){
                res.redirect('tpk-index');
            }) ;
        }else{
            TestPackageService.update(infoSave,function(err,data){
                res.redirect('tpk-index');
            }) ;
        }
    }
    app.post('/tpk-save',initUser,testPackageSave);


//    app.get('/tpk-to-save',initUser,testPackageSave);

    var testPackagePaperSet = function (req,res,next){
        asseton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        page.user = req.user;
        TestPackageService.loadById(req.params.id,function(err,data){
            var paperIdArr = JSON.parse(data.paperArr) ;
            var paperArr = new Array() ;
            for(var point=0;paperIdArr.length<point;point++){

            }
            input.checkPaperList = paperArr ;
            input.info = data ;
            res.render('tpk-paper-set', input);
        });
    }
    app.get('/tpk-paper-set:id',initUser,testPackagePaperSet);

};