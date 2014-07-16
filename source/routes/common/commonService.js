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
