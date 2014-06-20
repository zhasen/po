var logger = require('../commons/logging').logger;
var util = require('util');
var userService = require('../services/TestUserService');
var Papers = require('../models/Enums');

module.exports = function(app) {
    var mode = app.get('env') || 'development';
    var assEton = require('../middlewares/asseton')(mode);
    var checkLogin = function(req, res, next) {
        assEton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        var user = req.user;
        page.user = user;
        input.errMessage  = "" ;
        input.loginName="";
        if(req.path=="/user-reg" || (req.session && !req.session.loginType)){
            next() ;
        }else{
            res.redirect("/login") ;
        }
//        res.render('loginPanel', input);
    };

    app.get(/^\/user(-.*)?$/,checkLogin);
    var toLogin = function(req, res, next) {
        assEton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        var user = req.user;
        page.user = user;
        input.errMessage  = "" ;
        input.loginName="";
        res.render('loginPanel', input);
    };
    app.get('/user-login',toLogin);
//执行登录提交
    var doLogin = function(req, res, next) {
        assEton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        var user = req.user;
        page.user = user;
        var name = req.body.loginName ;
        var pwd = req.body.password ;
        input.loginName = name ;
        if(null==name || name==""){
            input.errMessage  = "用户名不能为空" ;
            res.render('loginPanel', input);
        }else if(null==pwd || pwd==""){
            input.errMessage  = "密码不能为空" ;
            res.render('loginPanel', input);
        }else {
            userService.login(name,pwd,function(flag,data){
                if(flag){
//                    data = Json.param
                    input.errMessage  = "登录邮箱：" +data.email;
                    res.render('loginPanel', input);
                }else{
                    input.errMessage  = data ;
                    res.render('loginPanel', input);
                }
            })
        }

    };
    app.post('/user-login_submit',doLogin);
    var toRes = function(req, res, next) {
        assEton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        var user = req.user;
        page.user = user;
        input.errMessage = "" ;
        input.loginName = "";
        input.email = "" ;
        res.render('u-signup', input);
    };
    app.get('/user-reg',toRes);
    var doRes = function(req, res, next) {
        assEton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        var user = req.user;
        page.user = user;
        var email = req.body.email ;
        var loginName = req.body.loginName ;
        var password = req.body.password ;
        var passwordAgain  = req.body.passwordAgain ;
        input.email=email ;
        input.loginName = loginName ;
        if(null==email || email==""){
            input.errMessage  = "邮箱不能为空" ;
            res.render('u-signup', input);

        }else if(email.replace(/^.+@.*$/,"").length>0){
            input.errMessage  = "邮箱格式不正确" ;
            res.render('u-signup', input);
        }else if(loginName.replace(/^[a-zA-Z][0-9a-zA-Z-_]{5,20}$/,"").length>0){
            input.errMessage  = "用户名只能是以字母开头大于5小于20长度的字符串" ;
            res.render('u-signup', input);
        }else if(null==loginName || loginName==""){
            input.errMessage  = "用户名不能为空" ;
            res.render('u-signup', input);
        }else if(null==password || password=="" || passwordAgain==null || passwordAgain=="" ){
            input.errMessage  = "密码不能为空" ;
            res.render('u-signup', input);
        }else if(password!=passwordAgain){
            input.errMessage  = "两次密码输入不一致" ;
            res.render('u-signup', input);
        }else {
            var user = {loginName:loginName,
                email:email,
                password:password
                }
            userService.regUser(user,function(flag,data){
                if(flag){
                    input.errMessage  = "注册成功" ;
                    res.render('u-signup', input);
                }else{
                    input.errMessage  = data ;
                    res.render('u-signup', input);
                }
            })
        }
    };
    app.post('/user-reg-submit',doRes);
    var toUserList = function(req, res, next) {
        assEton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        var user = req.user;
        page.user = user;
        var papers = {} ;
        papers.lm = Papers.lifeFlag.map ;
        papers.list = Papers.lifeFlag.list ;
        input.papers=papers;
        userService.selectAll(function(list){
            input.allUser =list ;
                res.render('u-list', input);
        });
    };
    app.get('/user-list',toUserList);

    var toChangeType = function(req, res, next) {
        assEton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        var user = req.user;
        page.user = user;
        userService.changeCertified(req.params.name,req.params.type,function(flag,data){
            if(flag){
                next() ;
            }
        }) ;
    };
    app.get('/user-changeType-:name-:type',toChangeType,toUserList);
};