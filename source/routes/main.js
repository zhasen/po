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
        ixdf.userBasicData(user.id, function (err, userData) {
            if(userData) {
                user.type = userData.type; // 用户类型，老师 2 学员 1
                user.code = userData.data.sCode || userData.data.Code; // 学员code 或者 老师code
                user.schoolid = userData.data.nSchoolId || userData.data.SchoolId; // 学员或者老师所在的学校ID
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
//        console.log('--------->user:');
//        console.log(user);
        if(user) {
            ixdf.myClass({type: user.type, schoolid: user.schoolid, code: user.code}, function (err, myClass) {
                PageInput.i(req).put('myClass', myClass);
                next();
            });
        } else {
            res.redirect('/main-login');
        }
    };

    var indexPage = function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
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

    //绑定学员号
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
            console.log('------------>绑定学院号接口返回信息:');
            console.info(ret);
            if(ret.Data == true) {
                var userid = req.session.user.id;

                ixdf.userBasicData(userid, function (err, userData) {
                    console.log('-------->通过ID查身份返回信息:');
                    console.log(userData);
                    if(userData) {
                        req.session.user.type = userData.type; // 用户类型，老师 2 学员 1
                        req.session.user.code = userData.data.sCode || userData.data.Code; // 学员code 或者 老师code
                        req.session.user.schoolid = userData.data.nSchoolId || userData.data.SchoolId; // 学员或者老师所在的学校ID
                        console.log('------------->改变之后的session：');
                        console.log(req.session.user);
                        res.redirect('/');
                    }else {
                        res.redirect('/main-bind');
                    }
                });
                //再次用userid 调用获取角色接口然后获取shcoolid scode 等数据。
            }else {
                res.redirect('/main-bind?err='+ret.Error);
                //打印出错误信息并停留在当前页面
            }
        });

    });


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

}
;