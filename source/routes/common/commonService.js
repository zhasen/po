var http = require('http');
//var request = require("request");
http.globalAgent.maxSockets = 50000;
var TIMEOUT = 60*1000;

exports.request = function(options, callback) {
    var logInfo = "http请求:" + options;
	var post_req = http.request(options, function(result) {
		console.log(logInfo);
		var data = '';
        result.setEncoding("utf8");
		result.on("data", function(chunk) {
			data += chunk;
		});
		result.on('end', function() {
			console.log("请求返回结果，result:" + data.toString());
            callback(null,data);
		});
	});
	post_req.setTimeout(TIMEOUT, function() {
		post_req.abort();
        callback(new Error('Request timeout'));
	});
	post_req.on('error', function(e) {
		callback(new Error("httpGet : exception " + e.message));
	});
	post_req.end();
};

exports.getUrl = function(map){
    var val = "";
    for (var key in map) {
        val += key +"="+ encodeURIComponent(map[key]) +"&";
    }
    val = val.substr(0,val.length-1);
    return val;
};

exports.getPaperItems = function (pagerId,callback) {
    var str = "http://116.213.70.92/oms2/public/oms/api/omsapi!oms2Api.do?";

    str += "method="+'getPaperAllDataByPaperId';
    str += "&paperId="+pagerId;

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

        for (var i = 0; i < structItem.length; i++) {
            var part = structItem[i];
            build(part);
        }
        callback(part);

    });
}
