var logger = require('../commons/logging').logger;
var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var ixdf = require('../services/IXDFService');
var NewsAdmin = require('../services/NewsAdminService');
var settings = require('../../settings');
var crypto = require('crypto');
var request = require('request');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    auth.afterLogin = function (user, next) {
        ixdf.userBasicData(user.id, function (err, userData) {
            if (userData) {
                user.type = userData.type; // 用户类型，老师 2 学员 1
                user.code = userData.data.sCode || userData.data.Code; // 学员code 或者 老师code
                user.schoolid = userData.data.nSchoolId || userData.data.SchoolId; // 学员或者老师所在的学校ID
                console.log('----------------->');
                console.log(userData);
                console.log(user);
                next();
            } else {
                user.type = 5;//游客
                next();
            }
        });
    };
    auth.bind(app);//use all authentication routing and handlers binding here

    // 取每个学员/老师的前六个班级，用于顶部公共导航条
    var getMyClass = function (req, res, next) {
        var user = req.session.user;
        if (user) {
            ixdf.myClass({type: user.type, schoolid: user.schoolid, code: user.code}, function (err, myClass) {
                PageInput.i(req).put('myClass', myClass);
                if (user.type == 1 || user.type == 9) {
                    var type = 1;
                } else if (user.type == 2 || user.type == 22) {
                    var type = 2;
                } else {
                    var type = 5;
                }
                NewsAdmin.listAllNews(type, function (err, msglist) {
                    if (err) {
                        logger.log(err);
                    }
                    var msg_no_read = [];
                    if (msglist) {
                        for (var i = 0; i < msglist.length; i++) {
                            if (msglist[i].is_delete.indexOf(user.id) == -1 && msglist[i].is_read.indexOf(user.id) == -1) {
                                msg_no_read[i] = msglist[i];
                            }
                        }
                        var num_no_read = msg_no_read.length;
                    } else {
                        var num_no_read = 0;
                    }
                    PageInput.i(req).put('num_no_read', num_no_read);
                    PageInput.i(req).put('msglist', msglist);
                    next();
                });
            });
        } else {
            res.redirect('/main');
        }
    };

    //汉字加密不乱码
    var md51 = function (str) {
        var Buffer = require('buffer').Buffer;
        var buf = new Buffer(1024);
        var len = buf.write(str, 0);
        str = buf.toString('binary', 0, len);
        var md5sum = crypto.createHash('md5');
        md5sum.update(str);
        str = md5sum.digest('hex');
        return str;
    };

    //会员首页
    var indexPage = function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        res.render('index_' + input.token, input);
    };
    app.get('/', getMyClass, indexPage);


//    var getCurrentClass = function (req, res, next) {
//        PageInput.i(req).put('currentClass', {id: 'xxx', name: '语文'});
//        next();
//    };
//
//    app.get('/test', getCurrentClass, function (req, res, next) {
//        asseton(req, res);
//        var input = PageInput.i(req);
//        res.render('test', input);
//    });

    //加载未登录首页
    app.get('/main', function (req, res) {
        asseton(req, res);
        var input = {};
        res.render('main', input);
    });

    //登陆页面
    app.get('/main-login', function (req, res) {
        asseton(req, res);
        var input = {};
        input.authorizeUrl = auth.oauthClient.getAuthorizeUrl(auth.oauthClient.clientHost + '/auth/jump');
        res.render('main-login', input);
    });

    //绑定学员号页面
    app.get('/main-bind', function (req, res) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;

        if (input.user.type == 1 || input.user.type == 9) {
            var type = 1;
        } else if (input.user.type == 2 || input.user.type == 22) {
            var type = 2;
        } else {
            var type = 5;
        }

        NewsAdmin.listAllNews(type, function (err, msglist) {
            if (err) {
                logger.log(err);
            }
            var msg_no_read = [];
            if (msglist) {
                for (var i = 0; i < msglist.length; i++) {
                    if (msglist[i].is_delete.indexOf(input.user.id) == -1 && msglist[i].is_read.indexOf(input.user.id) == -1) {
                        msg_no_read[i] = msglist[i];
                    }
                }
                var num_no_read = msg_no_read.length;
            } else {
                var num_no_read = 0;
            }
            //PageInput.i(req).put('num_no_read', num_no_read);
            input.page.num_no_read = num_no_read;
            //PageInput.i(req).put('msglist', msglist);
            input.page.msglist = msglist;

            //判断是否出错
            var err = req.query.err;
            if(err == 1) {
                input.err = '绑定学员号出错！';
            }else {
                input.err = null;
            }
            res.render('main-bind', input);
        });
    });

    //绑定学员号功能
    app.post('/main-bind', function (req, res) {
//        var userid = 'xdf001000862';
        var userid = req.session.user.id;
//        var email = 'i@xdf.cn';
        var email = req.session.user.email;
        var studentcode = req.body.studentcode;
        var studentName = req.body.studentName;
        var usertype = req.body.usertype;
        var m = "BindStudentCodeByStudentName";
        var k = settings.ixdf.appKey;
        var i = settings.ixdf.appid;
        var str = ("method=" + m + "&appid=" + i + "&userId=" + userid + "&email=" + email + "&studentcode=" + studentcode + "&studentName=" + studentName + "&usertype=" + usertype + "&appKey=" + k).toLowerCase();
        var md5Str = md51(str).toUpperCase();
        request({
            method: 'post',
            url: settings.ixdf.url + '/user',
            form: {
                method: m,
                appid: i,
                userId: userid,
                email: email,
                studentcode: studentcode,
                studentName: studentName,
                usertype: usertype,
                sign: md5Str
            }
        }, function (err, resp, ret) {
            console.log('---------------------------->学员号接口：');
            console.log(ret);
            //根据接口返回数据判断其绑定学院号的结果
            ret = JSON.parse(ret);
            console.log('------------>绑定学院号接口返回信息:');
            console.info(ret);
            //再次用userid 调用获取角色接口然后获取shcoolid scode 等数据。
            if (ret.Data == true) {
                var userid = req.session.user.id;

                ixdf.userBasicData(userid, function (err, userData) {
                    console.log('-------->通过ID查身份返回信息:');
                    console.log(userData);
                    if (userData) {
                        req.session.user.type = userData.type; // 用户类型，老师 2 学员 1
                        req.session.user.code = userData.data.sCode || userData.data.Code; // 学员code 或者 老师code
                        req.session.user.schoolid = userData.data.nSchoolId || userData.data.SchoolId; // 学员或者老师所在的学校ID
                        console.log('------------->改变之后的session：');
                        console.log(req.session.user);
                        res.redirect('/');
                    } else {
                        res.redirect('/main-bind');
                    }
                });
            } else {
                //打印出错误信息并停留在当前页面
                res.redirect('/main-bind?err=1');
            }
        });
    });

    //会员消息列表页
    app.get('/notifications', getMyClass, function (req, res) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        var user = input.page.user;
        input.user = user;

        if (input.user.type == 1 || input.user.type == 9) {
            var type = 1;
        } else if (input.user.type == 2 || input.user.type == 22) {
            var type = 2;
        } else {
            var type = 5;
        }
        NewsAdmin.listAllNews(type, function (err, message) {
            if (err) {
                logger.log(err);
            }
            for (var i = 0; i < message.length; i++) {
                if (message[i].is_delete.indexOf(req.session.user.id) == -1 && message[i].is_read.indexOf(req.session.user.id) == -1) {
                    //将用户ID放到is_read字符串里面
                    var msgitem = {};
                    msgitem.is_read = message[i].is_read + ',' + input.user.id;
                    msgitem.title = message[i].title;
                    msgitem.to = message[i].to;
                    msgitem.content = message[i].content;
                    msgitem.is_delete = message[i].is_delete;
                    NewsAdmin.update(type, message[i].id, msgitem, function (err, item) {
                        if (err) {
                            logger.log(err);
                        }
                    });
                }
            }
            input.message = message;
            input.uid = req.session.user.id;
            res.render('notifications', input);
        });
    });

    //会员消息删除
    app.get('/notifications/delete/:id', function (req, res) {
        var mid = req.params.id;
        var user = req.session.user;
        if (user.type == 1 || user.type == 9) {
            var type = 1;
        } else if (user.type == 2 || user.type == 22) {
            var type = 2;
        } else {
            var type = 5;
        }
        NewsAdmin.getById(type, mid, function (err, msgitem) {
            if (err) {
                logger.log(err);
            }
            if (msgitem) {
                var item = {};
                item.is_delete = msgitem.is_delete + ',' + user.id;
                item.title = msgitem.title;
                item.to = msgitem.to;
                item.content = msgitem.content;
                item.is_read = msgitem.is_read;
                NewsAdmin.update(type, mid, item, function (err, msg) {
                    if (err) {
                        logger.log(err);
                    }
                    console.log(msg);
                });
                res.redirect('/notifications');
            } else {
                res.redirect('/notifications');
            }
        });

    });

    //删除所有会员消息
    app.get('/notifications/delete', function (req, res) {
        var user = req.session.user;
        if (user.type == 1 || user.type == 9) {
            var type = 1;
        } else if (user.type == 2 || user.type == 22) {
            var type = 2;
        } else {
            var type = 5;
        }
        NewsAdmin.listAllNews(type, function (err, list) {
            if (err) {
                logger.log(err);
            }
            if (list) {
                for (var i = 0; i < list.length; i++) {
                    var item = {};
                    item.is_delete = list[i].is_delete + ',' + user.id;
                    item.title = list[i].title;
                    item.to = list[i].to;
                    item.content = list[i].content;
                    item.is_read = list[i].is_read;
                    NewsAdmin.update(type, list[i].id, item, function (err, msg) {
                        if (err) {
                            logger.log(err);
                        }
                        //console.log(msg);
                    });
                }
                res.redirect('/notifications');
            } else {
                res.redirect('/notifications');
            }
        });
    })

};