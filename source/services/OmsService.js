var settings = require('../../settings');
var crypto = require('crypto');
var request = require('request');
var Service = {};

//同步用户信息接口实现
Service.synLearnTestUser = function(UserId,SchoolId,Code,Email,callback) {
    var data = {
        UserId: UserId,
        SchoolId: SchoolId,
        Code: Code,
        Email: Email
    };
    console.log('------->同步用户信息接口参数:');
    console.log(data);
    var method = "synLearnTestUser";
    var key = settings.oms.appKey;
    //var key = 'u2_userKey_#_1omsy2e*@%';
    var str = (Code + Email + SchoolId + UserId + key).toLowerCase();
    var md5Str = md51(str).toUpperCase();
    var timestamp = new Date().Format("yyyy-MM-dd hh:mm:ss");
    request({
        method: 'post',
        url: settings.oms.omsUrl,
        //url: 'http://rd.xdf.cn/oms/public/oms/api/omsapi!oms2Api.do',
        form: {
            method: method,
            data: JSON.stringify(data),
            timestamp: timestamp,
            sign: md5Str
        }
    }, function (err, resp, ret) {
        ret = JSON.parse(ret);
        console.log('---------->同步用户信息接口测试:');
        console.info(ret);
        callback(err,ret);
    });
};

//绑定学员号接口
Service.bindStudentCode = function(UserId,Code,Email,StudentName,UserType,callback) {
    var method = "BindStudentCodeByStudentName";
    var appkey = settings.ixdf.appKey;
    var appid = settings.ixdf.appid;
    var str = ("method=" + method + "&appid=" + appid + "&userId=" + UserId + "&email=" + Email + "&studentcode=" + Code + "&studentName=" + StudentName + "&usertype=" + UserType + "&appKey=" + appkey).toLowerCase();
    var md5Str = md51(str).toUpperCase();
    request({
        method: 'post',
        url: settings.ixdf.url + 'user/',
        form: {
            method: method,
            appid: appid,
            userId: UserId,
            email: Email,
            studentcode: Code,
            studentName: StudentName,
            usertype: UserType,
            sign: md5Str
        }
    }, function (err, resp, ret) {
        ret = JSON.parse(ret);
        console.log('---------->绑定学员号接口测试:');
        console.info(ret);
        callback(err,ret);
    });
};




//转时间格式
Date.prototype.Format = function(fmt)
{
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
};


//MD5加密到汉字不乱码
var md51 = function (str) {
    var Buffer = require('buffer').Buffer;
    var buf = new Buffer(1024);
    var len = buf.write(str, 0);
    str = buf.toString('binary', 0, len);
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};


module.exports = Service;