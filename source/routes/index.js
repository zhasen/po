var main = require("./main")
    ,recordWebSocket = require("./recordWebSocket"),
    imitateExam = require("./imitateExam"),
    interactionClass = require("./interactionClass"),
    _classes_schedules = require('./_classes-schedules');

module.exports = function(app) {
    main(app);
    recordWebSocket(app);
    imitateExam(app);
    interactionClass(app);
    _classes_schedules(app);
    require("./interactiveClassroomDetail")(app);

    app.get('/getdata', function(req, res){

//        var str = '{"isNode": "false","isNode": "true","topDis": "20"}';
//
//        str = str.replace(/"false"|"true"|"\d+"/g,function(word){
//            return word.replace(/"/g,'');
////            if(word === '"false"'){
////                return "false";
////            }
////            else if(word === '"true"'){
////                return "true1"
////            }
////            else{
////                return "null";
////            }
//        });
//        console.log(str);

        var commonService = require('./common/commonService');
        var http = require('http');

        //commonService.request("http://116.213.70.92/oms2/public/oms/api/omsapi!oms2Api.do?method=getPaperAllDataByPaperId&paperId=B51D8504-9186-4079-9770-8AD73DC63BD9",function(data){
        commonService.request("http://tt.wx2u.com/5.json",function(data){
//            data = decodeURIComponent(data);
//            console.log(data);
//            var jsonObject = JSON.parse(data);
//            console.log(data);
//            console.log(jsonObject);

            //console.log(data);

            data = data.replace(/"false"|"true"|"\d+"/g,function(word){
                return word.replace(/"/g,'');
            });

            console.log('---------------------------------');

            //console.log(data);
            //var jsonObject = JSON.parse(data);
            //console.log(jsonObject);

            res.send("ok");

        });
    });
};