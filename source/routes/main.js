var logger = require('../commons/logging').logger;
var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var ixdf = require('../services/IXDFService');
var crypto = require('crypto');
var request = require('request');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    auth.afterLogin = function (user, next) {
//        console.log('-------> user session:');
//        console.log(user);
        // user示例：
        // { id: 'xdf001000862', displayName: '李梦晗', type: 1, code: 'BJ986146', schoolid: 1 } // 学员
        // { id: 'xdf00228972', displayName: '张洪伟', type: 2, code: 'BM0001', schoolid: 1 } // 老师
        ixdf.userBasicData(user.id, function (err, userData) {
            if(userData) {
                user.type = userData.type; // 用户类型，老师 2 学员 1
                user.code = userData.data.sCode || userData.data.Code; // 学员code 或者 老师code
                user.schoolid = userData.data.nSchoolId || userData.data.SchoolId; // 学员或者老师所在的学校ID
                next();
            }
//            else {
//                user.type = 5;//游客
//                user.code = null;
//                user.schoolid = null;
//                next();
//            }
        });
    };
    auth.bind(app);//use all authentication routing and handlers binding here
    //判断是否登录是否绑定了学员好
    var isLoginOrIsBind = function(req,res,next) {
        var user = req.session.user;
        if (user) {
            if(user.type == 5) {
                res.redirect('/main-bind');
            }else {
                next();
            }
        }else {
            res.redirect('/main-login');
        }
    };
    // 取每个学员/老师的前六个班级，用于顶部公共导航条
    var getMyClass = function (req, res, next) {
        var user = req.session.user;
        console.log('----------------->user:');
        console.log(user);
        if(user) {
            if(user.type == 1 || user.type == 2) {
                ixdf.myClass({type: user.type, schoolid: user.schoolid, code: user.code}, function (err, myClass) {
                    PageInput.i(req).put('myClass', myClass);
                    next();
                });
            }else {
                res.redirect('/main-bind');
            }
        }else {
            res.redirect('/main-login');
        }


    };

    var indexPage = function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;

        //console.log(req.session);
        res.render('index_' + input.token, input);
    };

    app.get('/', getMyClass, indexPage);

    var getCurrentClass = function (req, res, next) {
        PageInput.i(req).put('currentClass', {id: 'xxx', name: '语文'});
        next();
    };

    app.get('/test', getCurrentClass, function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        res.render('test', input);
    });

    app.get('/main', getMyClass, function (req, res) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        res.render('main', input);
    });

    app.get('/main-login', function (req, res) {
        asseton(req, res);
//        var input = PageInput.i(req);
        /*input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;*/
        var input = {};
        input.authorizeUrl = auth.oauthClient.getAuthorizeUrl();
        res.render('main-login', input);
    });

    app.get('/main-bind', function (req, res) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        //var userItem = req.session;
        //console.log(userItem);
        res.render('main-bind', input);
    });

    app.post('/main-bind', function (req, res) {
//        var userid = 'xdf001000862';
        var userid = req.session.user.id;
//        var email = 'i@xdf.cn';
        var email = req.session.user.email;
        var studentcode = req.body.studentcode;
        var studentName = req.body.studentName;
        var usertype = req.body.usertype;
        var m = "BindStudentCodeByStudentName";
        var k = "v5appkey_test";
        var i = "5001";
        var str = ("method=" + m + "&appid=" + i + "&userId=" + userid + "&email=" + email + "&studentcode=" + studentcode + "&studentName=" + studentName + "&usertype=" + usertype + "&appKey=" + k).toLowerCase();
        var md5Str = md51(str).toUpperCase();
        request({
            method: 'post',
            url: "http://xytest.staff.xdf.cn/api/user",
            form: {
                method: m,
                appid: 5001,
                userId: userid,
                email: email,
                studentcode: studentcode,
                studentName: studentName,
                usertype: usertype,
                sign: md5Str
            }
        }, function (err, resp, ret) {
            //根据接口返回数据判断其绑定学院号的结果
            ret = JSON.parse(ret);
            console.info(ret);
            if(ret.Date == true) {
                var userid = req.session.user.id;

                ixdf.userBasicData(userid, function (err, userData) {
                    if(userData) {
                        req.session.user.type = userData.type; // 用户类型，老师 2 学员 1
                        req.session.user.code = userData.data.sCode || userData.data.Code; // 学员code 或者 老师code
                        req.session.user.schoolid = userData.data.nSchoolId || userData.data.SchoolId; // 学员或者老师所在的学校ID
                        res.redirect('/');
                    }
                });
                //再次用userid 调用获取角色接口然后获取shcoolid scode 等数据。
            }else {
                req.redirect('/main-bind?err=');
                //打印出错误信息并停留在当前页面
            }
        });

    });

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

}
;