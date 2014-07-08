//互动课堂
var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var commonService = require('./common/commonService');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    //auth.bind(app);//use all authentication routing and handlers binding here

    app.get('/interaction-class', function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i().enums();
        console.log("input------------" + JSON.stringify(input));
        //input.user = {};
        res.render('interaction-class', input);
    }); // 模考测试页

};