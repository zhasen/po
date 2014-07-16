//互动课堂
var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var commonService = require('./common/commonService');
var api = require('../../settings').api;
var ixdf = require('../services/IXDFService');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    // 取每个学员/老师的前六个班级，用于顶部公共导航条
    var getMyClass = function (req, res, next) {
        // 测试数据，勿删除，等登录页面做好并打通后再删除
        req.session.user = { id: 'xdf001000862', displayName: '李梦晗', type: 1, code: 'BJ986146', schoolid: 1 }; // 学员
        //req.session.user = { id: 'xdf00228972', displayName: '张洪伟', type: 2, code: 'BM0001', schoolid: 1 }; // 老师

        var user = PageInput.i(req).page.user;
        ixdf.myClass({type: user.type, schoolid: user.schoolid, code: user.code}, function (err, myClass) {
            PageInput.i(req).put('myClass', myClass);
            next();
        });
    };

    app.get('/interaction-class',getMyClass, function (req, res, next) {
        asseton(req, res);
        var url = {
            "method":"getStudentPaperListInClass",
            "ccode":"TF13202",
            "ucode":"BJ986146",
            "sid":1,
            "paperTypeId":"hdkt",
            "ptype":""
        };
        var input = PageInput.i(req);
        input.classes = input.page.myClass; // 用于显示首页的六个班级
        input.token = input.page.user.type == 2 ? 'tch' : 'stu';
        input.user = input.page.user;
        var param = api.imitateExam + commonService.getUrl(url);
        console.log(param);
        commonService.request(param,function(data){
            console.log(data);
            var sdata = JSON.parse(data);
            input.data = sdata;
            console.log("sdata.result------------" +JSON.stringify(sdata.result));
                if(sdata.errno != 1){
                res.render('interaction-class',input);
            }else{
                res.end();
            }
        });
    }); // 模考测试页

};