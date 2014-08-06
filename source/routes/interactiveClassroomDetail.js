//互动课堂
//var auth = require('../middlewares/authenticate');
//var PageInput = require('./common/PageInput');

var request = require('request');
var interactiveClassroomDetailService = require('../services/InteractiveClassroomDetailService');

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
        data.userId = req.query.userId;
        data.classCode = req.query.classCode;
        data.testId = req.query.testId;
        data.pType = req.query.pType;

        if(!data.testId){
            data.testId = "";
            data.statusType = "normal";
        }
        else{
            data.statusType = "review";
        }

        res.render('interactive-classroom-detail', data);
    });


    var testSave = function(req, res) {
        var template = JSON.parse(JSON.stringify(req.body));
        console.log(template);
        console.log(template.method);
        console.log(template.data);
        console.log(JSON.stringify(template.data));
        request({
            method: 'post',
            url: "http://116.213.70.92/oms2/public/oms/api/omsapi!oms2Api.do",
            form: {
                data: JSON.stringify(template.data),
                method: template.method
            }
        }, function (err, resp, ret) {
            res.send(ret);
        });
    };
    app.post('/test-save', testSave);

    var testGet = function(req, res) {
        var template = JSON.parse(JSON.stringify(req.body));
        console.log(template);
        console.log(template.paperId);
        console.log(template.allotId);
        console.log(template.testId);
        console.log(template.userId);
        console.log(template.testFrom);
        console.log(template.method);
        var str = "http://116.213.70.92/oms2/public/oms/api/omsapi!oms2Api.do?";

        str += "method="+template.method;
        str += "&paperId="+template.paperId;
        str += "&allotId="+template.allotId;
        str += "&testFrom="+template.testFrom;
        str += "&userId="+template.userId;
        if(template.testId)
            str += "&testId="+template.testId;

        str += "&classCode=TF13202";

        console.log(str);

        request({
            method: 'get',
            url: str
        }, function (err, resp, ret) {
            res.send(ret);
        });
    };
    app.post('/test-get', testGet);

    app.get('/answer-get', function (req, res, next) {

        interactiveClassroomDetailService.findTestRecord({testId:req.query.testId},function(err,records){
            if(err){
                res.send(err.message);
            }
            else if(records.length == 0){
                res.send('未找到记录');
            }
            else{
                res.json(records);
            }
        })
    });

};