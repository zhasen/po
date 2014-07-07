//互动课堂
//var auth = require('../middlewares/authenticate');
//var PageInput = require('./common/PageInput');

module.exports = function (app) {
//    var mode = app.get('env') || 'development';
//    var asseton = require('../middlewares/asseton')(mode);
//
//    app.get('/interaction-class', function (req, res, next) {
//        asseton(req, res);
//        var input = PageInput.i().enums();
//        console.log("input------------" + JSON.stringify(input));
//        //input.user = {};
//        res.render('interaction-class', input);
//    }); // 模考测试页

    app.get('/interactive-classroom-detail', function (req, res, next) {
        //暂时通过query参数来做，以后会通过session里的判断身份以及权限的
        var data = {};
        //1 学生 2老师
        data.role = req.query.role;
        data.userID = req.query.userID;
        data.classCode = req.query.classCode;
        res.render('interactive-classroom-detail', data);
    });

};