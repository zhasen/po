module.exports = {
    id: 'po',
    name: '学路',
    creator: '新东方',
    secretKey: 'quick',
    app: {
        host: '127.0.0.1',
        port: 3010
    },
    oauth: {
        providerHost: 'http://testu2.staff.xdf.cn',
        providerAuthorizeUri: '',
        providerAccessTokenUri: '/apis/OAuth.ashx',
        providerLogoutUri: '/Logout.aspx',
        clientId: '95401',
        clientSecret: 'u2test-app1-d20-9c5f-4783-8316-ee814test',
        clientHost: 'http://testpath.xdf.cn'
    },
    mysql:{
        host: 'localhost',
        user: 'po',
        password: 'po',
        database:'po',
        port: 3306
    },
    redis:{
        host: 'localhost',
        port: 6379
    },
    session: {
        expires: 60 // minutes
    },
    logging: {
        reloadSecs: 0, //INFO: set 0 could let nodeunit tests which use log4js exit properly
        level: 'DEBUG'
    },
    file: {
        public: 'public',
        build: 'public/build',
        components: 'public/components',
        upload: 'public/upload',
        question: 'public/upload/question',
        answer: 'public/upload/answer'
    },
    api:{
        imitateExam:'http://116.213.70.92/oms2/public/oms/api/omsapi!oms2Api.do?'
    },
    resources: {
        appName: '学路',
        appTitle: '学路',
        appCreator: '新东方',
        errorUnknown: '不好意思，系统出了点小问题'
    }
};
