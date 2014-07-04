var crypto = require('crypto');
var request = require('request');
var Service = {};

var md5 = function (str) {
    return crypto.createHash('md5').update(String(str)).digest('hex');
};

/**
 * GetTeacherByUserId 接口
 * @param id 用户ID，示例 xdf001000862
 * 使用例子：GetTeacherByUserId('xdf001000862', function(err, ret){})
 */
Service.GetTeacherByUserId = function (id, callback) {
    var id = id;
    var m = "GetTeacherByUserId"; // todo: encapsulating
    var k = "v5appkey_test"; // todo: setting
    var i = "5001"; // todo: setting
    var str = ("method=" + m + "&appid=" + i + "&userId=" + id + "&appKey=" + k).toLowerCase();
    var md5Str = md5(str).toUpperCase();
    request({
        method: 'post',
        url: "http://xytest.staff.xdf.cn/api/Teacher/", // todo: setting
        form: {
            method: m,
            appid: i,
            userId: id,
            sign: md5Str
        }
    }, function (err, resp, ret) {
        if (err) {
            var errMsg = 'Fail in GetTeacherByUserId API: ' + err.message;
            logger.error(errMsg);
            callback(new Error(errMsg), null);
        } else {
            ret = JSON.parse(ret);
            callback(null, ret);
        }
    });
};


module.exports = Service;
