var logger = require('../commons/logging').logger;
var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var ixdf = require('../services/IXDFService');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    auth.afterLogin = function (user, next) {
        console.log('-------> user session:');
        console.log(user);
        // user示例：
        // { id: 'xdf001000862', displayName: '李梦晗', type: 1, code: 'BJ986146', schoolid: 1 } // 学员
        // { id: 'xdf00228972', displayName: '张洪伟', type: 2, code: 'BM0001', schoolid: 1 } // 老师
        ixdf.userBasicData(user.id, function (err, userData) {
            user.type = userData.type; // 用户类型，老师 2 学员 1
            user.code = userData.data.sCode || userData.data.Code; // 学员code 或者 老师code
            user.schoolid = userData.data.nSchoolId || userData.data.SchoolId; // 学员或者老师所在的学校ID
            next();
        });
    };
    auth.bind(app);//use all authentication routing and handlers binding here

    // 取每个学员/老师的前六个班级，用于顶部公共导航条
    var getMyClass = function (req, res, next) {
        console.log(req.session);
        // 测试数据，勿删除，等登录页面做好并打通后再删除
        //req.session.user = { id: 'xdf001000862', displayName: '李梦晗', type: 1, code: 'BJ986146', schoolid: 1 }; // 学员
        req.session.user = { id: 'xdf00228972', displayName: '张洪伟', type: 2, code: 'BM0001', schoolid: 1 }; // 老师

        var user = PageInput.i(req).page.user;
        ixdf.myClass({type: user.type, schoolid: user.schoolid, code: user.code}, function (err, myClass) {
            PageInput.i(req).put('myClass', myClass);
            next();
        });
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

    app.get('/main',getMyClass,function(req,res) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        res.render('main',input);
    });

    app.get('/main-login',getMyClass,function(req,res) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;

        res.render('main-login',input);
    });

    app.get('/main-bind',getMyClass,function(req,res) {
        asseton(req, res);
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        var userItem = req.session;
        console.log(userItem);
        res.render('main-bind',input);
    });

    app.post('/main-bind',function(req,res) {
        var usertype = req.body.usertype;
        
        console.log(usertype);
        res.redirect('/');
    });

};