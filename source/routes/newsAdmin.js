var PageInput = require('./common/PageInput');
var ixdf = require('../services/IXDFService');
var logger = require('../commons/logging').logger;
var util = require('util');
var time = require('../commons/time');
var NewsAdminService = require('../services/NewsAdminService');
var NewsAdmin = require('../models/NewsAdmin').model;

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    // 取每个学员/老师的前六个班级，用于顶部公共导航条
    var getMyClass = function (req, res, next) {
        //console.log(req.session);
        // 测试数据，勿删除，等登录页面做好并打通后再删除
        req.session.user = { id: 'xdf001000862', displayName: '李梦晗', type: 1, code: 'BJ986146', schoolid: 1 }; // 学员

        var user = PageInput.i(req).page.user;
        ixdf.myClass({type: user.type, schoolid: user.schoolid, code: user.code}, function (err, myClass) {
            PageInput.i(req).put('myClass', myClass);
            next();
        });
    };
    //登录页面加载
    app.get('/news-admin-login',getMyClass,function(req,res) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;

        var error = req.query.error || '';
        input.error = error;

        console.log(req.session);

        res.render('news-admin-login',input);
    });
    //登录表单提交
    app.post('/news-admin-login',function(req,res) {
        var account = req.body.account;
        var password = req.body.password;
        if(account == 'admin' && password == '123456') {
            res.redirect('/news-admin');
        }else {
            res.redirect('/news-admin-login?error=true');
        }
    });

    //消息列表页面加载
    app.get('/news-admin',getMyClass,function(req,res) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;

        NewsAdminService.listAllNews(function(err,list) {
            console.log(list);
            input.list = list;
            res.render('news-admin',input);
        });
    });

    //消息添加页面加载
    app.get('/news-admin-add',getMyClass,function(req,res) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        res.render('news-admin-add',input);
    });

    //执行添加功能
    app.post('/news-admin-add',function(req,res) {
        NewsAdminService.insert(req.body,function(err,item) {
            if (err) {
                console.err('save error'); // TODO: 页面弹出提示窗，不跳转页面
            } else {
                res.redirect('/news-admin');
            }
        });

    });

    //删除
    app.get('/news-del-:id',function(req,res) {
        NewsAdminService.delete(req.params.id,function(err) {
            if(err) {
                logger.error(err);
            }
            res.redirect('/news-admin');
        });
    });

    //查看详细
    app.get('/news-detail-:id',getMyClass,function(req,res) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        NewsAdminService.getById(req.params.id,function(err,item) {
            if(err) {
                logger.error(err);
            }
            input.item = item;
            res.render('news-admin-detail',input);
        });
    });

};