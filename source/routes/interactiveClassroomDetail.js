//互动课堂
//var auth = require('../middlewares/authenticate');
//var PageInput = require('./common/PageInput');

var request = require('request');
var async = require('async');
var interactiveClassroomDetailService = require('../services/InteractiveClassroomDetailService');
var ixdf = require('../services/IXDFService');
var oms = require('../../settings').oms;

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
        //data.role = req.query.role;
        //data.userId = req.query.userId;
        //1 学生 2老师
        data.role = parseInt(req.session.user.type);
        data.userId = req.session.user.code;
        data.schoolId = req.query.schoolId;
        data.classCode = req.query.classCode;
        data.testId = req.query.testId;
        data.pType = req.query.pType;
        data.paperId = req.query.paperId;
        data.allotId = req.query.allotId;

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
            url: oms.omsUrl,
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
        var str = oms.omsUrl + "?";

        str += "method="+template.method;
        str += "&paperId="+template.paperId;
        str += "&allotId="+template.allotId;
        str += "&testFrom="+template.testFrom;
        str += "&userId="+template.userId;
        if(template.testId)
            str += "&testId="+template.testId;

        str += "&classCode="+template.classCode;

        console.log(str);

        request({
            method: 'get',
            url: str
        }, function (err, resp, ret) {
            res.send(ret);
        });
    };
    app.post('/test-get', testGet);

    var testGetAll = function(req, res) {

        var str = oms.omsUrl + "?";

        str += "method="+'getPaperAllDataByPaperId';
        str += "&paperId="+'B51D8504-9186-4079-9770-8AD73DC63BD9';

        console.log(str);

        request({
            method: 'get',
            url: str
        }, function (err, resp, ret) {

            var structItem = JSON.parse(ret).result.structItem.trees;

            var parts = {};

            function build(treeNode, parent){
                if(treeNode.items && treeNode.items.length > 0){
                    var relation;
                    if(treeNode.relation){
                        relation = treeNode.relation;
                    }else if(parent && parent.relation){
                        relation = parent.relation;
                    }
                    if(relation){
                        treeNode.relation = relation;
                    }
                    if(parent){
                        treeNode.displayName = parent.name + "/" + treeNode.name;
                    }else{
                        treeNode.displayName = treeNode.name;
                    }

                    //开始循环part下每一个item
                    for (var ti = 0; ti < treeNode.items.length; ti++) {
                        var item = treeNode.items[ti];
                        var subjectData = item.item.subjectData;
                        subjectData = decodeURIComponent(subjectData); //对题目的定义进行解码处理
                        var subjectList = JSON.parse(subjectData);

                        console.log(subjectList.id);
                        parts[subjectList.id] = item.item;

                    }

                }else if(treeNode.trees && treeNode.trees.length > 0){
                    //有子节点，递归构建
                    for (var i = 0; i < treeNode.trees.length; i++) {
                        var childTreeNode = treeNode.trees[i];
                        build(childTreeNode, treeNode);
                    }
                }
            }
            console.log("begin");
            for (var i = 0; i < structItem.length; i++) {
                var part = structItem[i];
                build(part);
            }
            console.log("end");
        });
    };
    app.get('/test-get-all', testGetAll);

    app.get('/answer-get', function (req, res, next) {

        interactiveClassroomDetailService.findTestRecord({testId:req.query.testId},function(err,records){
            if(err){
                res.send(err.message);
            }
            else if(records.length == 0){
                res.send('未找到记录');
            }
            else{
                if(req.query.role == interactiveClassroomDetailService.ALLROLL.student){
                    res.json(records);
                }
                else if(req.query.role == interactiveClassroomDetailService.ALLROLL.teacher){

                    async.parallel({
                            record: function(callback){
                                interactiveClassroomDetailService.findTestRecord({testId:{in:JSON.parse(records[0].data)}},function(err,records){
                                    callback(err, records);
                                });
                            },
                            students: function(callback){
                                ixdf.uniAPIInterface({
                                    schoolid: records[0].schoolId,
                                    classCode: records[0].classCode
                                }, 'class', 'GetStudentsOfClass', function (err, ret) {
                                    callback(err, ret.Data);
                                });
                            }
                        },
                        function(err, results) {
                            if(err){
                                res.send(err.message);
                            }
                            else{
                                var selectPages;
                                var studentsMap = {};
                                for(var i = 0 ; i < results.record.length ; i++){
                                    var info = results.record[i];
                                    studentsMap[info.userId] = JSON.parse(info.data);
                                    if(!selectPages){
                                        selectPages = JSON.parse(info.selectPage);
                                    }
                                }

                                var students = new Array();
                                for(var i = 0 ; i < results.students.length ; i++){
                                    var info = results.students[i];
                                    students.push({name:info.Name,code:info.Code,status:studentsMap[info.Code]?1:0});
                                }

                                results.selectPages = selectPages;
                                results.testData = studentsMap;
                                results.students = students;
                                delete results.record;

                                res.json(results);
                            }
                        });
                }
                else{
                    res.send('未知错误');
                }
            }
        })
    });

};