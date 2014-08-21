var settings = {
    id: 'po',
    name: '学路',
    creator: '新东方',
    secretKey: 'quick',
    app: {
        host: '127.0.0.1',
        port: 3010,
        domain: 'path.staff.xdf.cn',
        context: '/'
    },
    oauth: {
        providerHost: 'http://testu2.staff.xdf.cn',
        providerAuthorizeUri: '/i/v2/index.aspx', //for authorizing in iframe
        providerAccessTokenUri: '/apis/OAuth.ashx',
        providerLogoutUri: '/Logout.aspx',
        clientId: '95401',
        clientSecret: 'u2test-app1-d20-9c5f-4783-8316-ee814test',
        clientHost: 'http://path.staff.xdf.cn'
    },
    ixdf: {
        url: 'http://xytest.staff.xdf.cn/api/', // 正式：http://i.xdf.cn/api/
        appKey: 'v5appkey_test', // 测试v5appkey_test，正式需申请
        //appKey: 'u2_userKey_#_1omsy2e*@%',
        appid: '5001' // 测试5001，正式需申请
    },
    mysql: {
        host: 'localhost',
        user: 'po',
        password: 'po',
        database: 'po',
        port: 3306
    },
    redis: {
        mode: 'single',
        host: 'localhost',
        port: 6379,
        auth: '',
        sentinel: {
            hosts: [
                {host: '127.0.0.1', port: 26379}
            ],
            masterName: 'mymaster'
        }
    },
    session: {
        expires: 60 // minutes
    },
    logging: {
        reloadSecs: 0, //INFO: set 0 could let nodeunit tests which use log4js exit properly
        level: 'DEBUG' // INFO
    },
    file: {
        public: 'public',
        build: 'public/build',
        components: 'public/components',
        upload: 'public/upload',
        question: 'public/upload/question',
        answer: 'public/upload/answer',
        schedule: 'public/upload/schedule', // 存放生成的课表PDF文件
        record: 'public/upload/record/',//互动课堂录音存放目录
        report: 'public/upload/report' // 存放模考报告PDF文件
    },
    oms: {
        omsUrl: 'http://116.213.70.92/oms2/public/oms/api/omsapi!oms2Api.do',
        appKey: ''
    },
    resources: {
        appName: '学路',
        appTitle: '学路',
        appCreator: '新东方',
        errorUnknown: '不好意思，系统出了点小问题'
    }
};

var util = require('./source/commons/util');
var profile = function () {
    var profilePath = '';
    var mode = process.env['NODE_ENV'] || 'development';
    var profileSettings = null;
    try {
        if (mode == 'development') {
            profilePath = './settings-dev';
            profileSettings = require(profilePath);
        } else {
            profilePath = './settings-prd';
            profileSettings = require(profilePath);
        }
    }
    catch (e) {
        console.error(profilePath + ' is not found: ' + e.message);
    }
    return profileSettings;
};

var profileSettings = profile();
if (profileSettings) {
    util.extendAll(settings, profileSettings);
}

module.exports = settings;
