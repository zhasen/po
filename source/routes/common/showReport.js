var commonService = require('./commonService');
var omsUrl = require('../../../settings').oms.omsUrl;
var reportJson = require('../../../report');
var bunyan = require('bunyan');

var mtlog = bunyan.createLogger({
    name: "mt",
    streams: [{
        type: 'rotating-file',
        path: 'logs/mt.log',
        period: '1d',   // daily rotation
        count: 5        // keep 3 back copies
    }]
});

//获取模考报告数据
exports.showReport = function(req,res,reportdata){
    var mtMessage ={
        "userName":reportdata.userName,
        "finishTime":reportdata.finishTime,
        "paperName":reportdata.paperName
    };

    var url = {
        "method":"getTestReportData",
        "testId":reportdata.testId
    };

    var param = omsUrl + "?" + commonService.getUrl(url);

    //统计 写作/口语 总分
    var scoreNum = 0;
    function getScoreNum(data){
        for(var i in data){
            scoreNum += parseInt(JSON.parse(data[i].correctResult).score);
        }
        return scoreNum;
    }

    //阅读真实分数
    function getReadScore(num){
        if(num>=0 && num<=9){
            return 0;
        }else if(num>10&&num<=33){
            return num-9;
        }else if(num>=34&&num<=35){
            return 25;
        }else if(num>=36&&num<=37){
            return 26;
        }else if(num>=38&&num<=39){
            return 27;
        }else if(num>=40&&num<=41){
            return 28;
        }else if(num>=42&&num<=43){
            return 29;
        }else if(num>=44&&num<=45){
            return 30;
        }
    }

    //听力真实分数
    function getListenScore(num){
        if(num<=4 && num>=0){
            return 0;
        }else{
            return num-4;
        }
    }

    commonService.request(param,function(err,data){
        mtlog.info("http请求:"+param);
        mtlog.info("http请求返回结果，Result:"+data);
        var sdata = JSON.parse(data);

        if(sdata.errno != 1){
            var essayRecordList = sdata.result.essayRecordList;
            var oralRecordList = sdata.result.oralRecordList;
            //写作分数
            var essayScore = getScoreNum(essayRecordList);
            //口语分数
            scoreNum = 0;
            var oralScore = getScoreNum(oralRecordList);
            var items = sdata.result.testResultDetailList;
            //听力分数
            var listenScore = 0;
            //阅读分数
            var readScore = 0;
            var itemLength = 0;

            //综合写作
            var integratedWriting = 0;
            //独立写作
            var independentWriting = 0;
            //学术课堂
            var scholarshipClass = 0;
            //校园对话
            var campusDialogue = 0;
            //独立任务
            var independentTask = 0;
            var detail ={};

            for(var i in essayRecordList){
                if(i==0){
                    //综合写作
                    detail.integratedWriting = parseInt(JSON.parse(essayRecordList[i].correctResult).score);
                }else if(i==1){
                    //独立写作
                    detail.independentWriting = parseInt(JSON.parse(essayRecordList[i].correctResult).score);
                }
            }

            for(var i in oralRecordList){
                if(i==0){
                    //独立任务
                    detail.independentTask = parseInt(JSON.parse(oralRecordList[i].correctResult).score);
                }else if(i==1){
                    //校园对话
                    detail.campusDialogue = parseInt(JSON.parse(oralRecordList[i].correctResult).score);
                }else if(i==2){
                    //学术课堂
                    detail.scholarshipClass = parseInt(JSON.parse(oralRecordList[i].correctResult).score);
                }

            }

            commonService.getPaperItems(reportdata.paperId,function(result){
                for(var i in items){
                    itemLength++;
                    var subjectId = items[i].subjectId;
                    var subjectMark = items[i].subjectMark;
                    for(var j in result){
                        if(subjectId == j && result[j].subjectType == 'TOEFL_LISTEN'){
                            listenScore += subjectMark;
                        }else if(subjectId == j && result[j].subjectType == 'TOEFL_READ'){
                            readScore += subjectMark;
                        }
                    }

                    if(itemLength == items.length){
                        readScore = getReadScore(readScore);
                        listenScore = getListenScore(listenScore);
                        var totalScore = essayScore+oralScore+listenScore+readScore;
                        var mtScore ={
                            "essayScore":essayScore,
                            "oralScore":oralScore,
                            "listenScore":listenScore,
                            "readScore":readScore,
                            "totalScore":totalScore
                        };
                        res.render('ie-report', {reportData:sdata,data:mtScore,mtMessage:mtMessage,detail:detail,reportJson:reportJson.content});
                    }

                }

            });
        }else{
            console.log("获取报告出错");
            res.render('ie-report',{reportData:sdata});
        }
    });

}
