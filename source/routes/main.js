var logger = require('../commons/logging').logger;
var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var ixdf = require('../../source/services/IXDFService');
var time = require('../../source/commons/time');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    auth.afterLogin = function(user, next){
//        user.studentNo = 'xxxxxx';
//        next();
        var getStudentNo = function(userId, callback){
            callback(null, 'test-student-no');
        };
        getStudentNo(user.id, function(err, studentNo){
            user.studentNo = studentNo;
            console.log(user);
            next();
        });
    };
    auth.bind(app);//use all authentication routing and handlers binding here

    var indexPage = function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i();
        input.user = {};

        //var userid = 'xdf00228972'; // 模拟数据1 张洪伟 老师
        var userid = 'xdf001000862'; // 模拟数据2 李梦晗 学员

        ixdf.userBasicData(userid, function (err, userData) {
            userData.class6.forEach(function (clas) {
                clas.poBeginDate = time.format(time.netToDate(clas.BeginDate), 'yyyy.MM.dd')
                clas.poEndDate = time.format(time.netToDate(clas.EndDate), 'yyyy.MM.dd')
            });
            input.classes = userData.class6;
            input.token = userData.token;
            res.render('index_' + userData.token, input);
        });

    };
    app.get('/', indexPage);

    var getCurrentClass = function(req, res, next){
        PageInput.i(req).put('currentClass', {id: 'xxx', name: '语文'});
        next();
    };

    app.get('/test', getCurrentClass, function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i(req);
        res.render('test', input);
    });

};