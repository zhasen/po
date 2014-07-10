//互动课堂
var auth = require('../middlewares/authenticate');
var PageInput = require('./common/PageInput');
var commonService = require('./common/commonService');
var api = require('../../settings').api;

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    app.get('/interaction-class', function (req, res, next) {
        asseton(req, res);
        var url = {
            "method":"getXpoListByClassCode",
            "ccode":"TF13202",
            "ucode":"BJ986146",
            "sid":1
        };
        var input = PageInput.i().enums();
        input.user = {};
        var param = api.imitateExam + commonService.getUrl(url);
        res.render('interaction-class', input);
//        commonService.request(param,function(data){
//            dataTemp ={
//                "errno": 0,
//                "result": [
//                    {
//                        "allotID": "7f032df1-d2f5-44b0-af34-6cf2b4f011b1",
//                        "flagFinish": -1,
//                        "paperId": "33818BD0-C00B-48B2-8F25-2624CFF8BC53",
//                        "paperName": "mini-TPO9-模拟",
//                        "paperTypeId": "tpo"
//                    },
//                    {
//                        "allotID": "97d62ebd-b52b-4d74-80fc-6e6b3019b373",
//                        "flagFinish": 0,
//                        "paperId": "B51D8504-9186-4079-9770-8AD73DC63BD9",
//                        "paperName": "mini-TPO25-模拟1",
//                        "paperTypeId": "tpo"
//                    },
//                    {
//                        "allotID": "91af5209-1ee6-4e78-9672-05b84ff78bef",
//                        "flagFinish": 1,
//                        "paperId": "24C89AB5-F2D5-404D-B8D0-9130EA6441FF",
//                        "paperName": "mini-TPO17-模拟",
//                        "paperTypeId": "tpo"
//                    },
//                    {
//                        "allotID": "3cc436d3-461c-4a0e-aa55-de9b02a572cb",
//                        "flagFinish": 0,
//                        "paperId": "8CAC753C-4C72-4839-98E9-D4E4D5E3DD7C",
//                        "paperName": "mini-TPO11-模拟",
//                        "paperTypeId": "tpo"
//                    }
//                ]
//            };
//            if(dataTemp.errno != 1){
//                res.render('interaction-class', {"input":input,"sdata":dataTemp});
//            }else{
//                res.end();
//            }
//        });
    }); // 模考测试页

};