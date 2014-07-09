var logger = require('../commons/logging').logger;
var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var util = require('util');
var DictService = require('../services/DictService');
var ixdf = require('../../source/services/IXDFService');
var time = require('../../source/commons/time');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

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

    app.get('/test', function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i();
        input.user = req.session.user;
        res.render('test', input);
    });

};