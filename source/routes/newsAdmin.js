var PageInput = require('./common/PageInput');
var ixdf = require('../services/IXDFService');
var logger = require('../commons/logging').logger;
var util = require('util');
var time = require('../commons/time');
var NewsAdminService = require('../services/NewsAdminService');
var NewsAdmin = require('../models/StuNewsAdmin').model;
var UserService = require('../services/UserService');
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
            res.redirect('/main-login');
        }
    };
    //判断当前会员是否有权限查看该页面内容
    var isAdmin = function(req,res,next) {
        UserService.loadById(req.session.user.id,function(err,item) {
            var roles = item.roles;
            if(roles) {
                if(roles.indexOf('admin') != -1 ) {
                    next();
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        });
    };

    /*
        消息列表页面加载
        1:表示学生
        2:表示老师
        5:游客
     */
    app.get('/news-admin',getMyClass,isAdmin,function(req,res) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        NewsAdminService.listAllNews(1,function(err,stulist) {

            var len = stulist.length;
            for(var i=0; i<len; i++){
                var item = stulist[i];
                item.crtOn = item.crtOn.format();
                item.updOn = item.updOn.format();
            }
            input.stulist = stulist;

            NewsAdminService.listAllNews(2,function(err,tealist) {
                var len = tealist.length;
                for(var i=0; i<len; i++){
                    var item = tealist[i];
                    item.crtOn = item.crtOn.format();
                    item.updOn = item.updOn.format();
                }
                input.tealist = tealist;
                NewsAdminService.listAllNews(5,function(err,vislist) {
                    var len = vislist.length;
                    for(var i=0; i<len; i++){
                        var item = vislist[i];
                        item.crtOn = item.crtOn.format();
                        item.updOn = item.updOn.format();
                    }
                    input.vislist = vislist;
                    res.render('news-admin',input);
                });
            });
        });
    });

    //消息添加页面加载
    app.get('/news-admin-add',getMyClass,isAdmin,function(req,res) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        res.render('news-admin-add',input);
    });

    //执行添加功能
    app.post('/news-admin-add',function(req,res) {
        NewsAdminService.insert(req.body.to,req.body,function(err,item) {
            if (err) {
                console.err('save error'); // TODO: 页面弹出提示窗，不跳转页面
            } else {
                res.redirect('/news-admin');
            }
        });

    });

    //删除
    app.get('/news-del-:to-:id',function(req,res) {
        NewsAdminService.delete(req.params.to,req.params.id,function(err) {
            if(err) {
                logger.error(err);
            }
            res.redirect('/news-admin');
        });
    });

    //查看详细
    app.get('/news-detail-:to-:id',getMyClass,isAdmin,function(req,res) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        NewsAdminService.getById(req.params.to,req.params.id,function(err,item) {
            if(err) {
                logger.error(err);
            }
            input.item = item;
            res.render('news-admin-detail',input);
        });
    });

};