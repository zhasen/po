var uuid = require('uuid');
var request = require('request');
var querystring = require('querystring');
var defaultConfig = {
    providerHost: '', //the host of service provider in oauth2
    providerAuthorizeUri: '', //the authorize uri of service provider in oauth2
    providerAccessTokenUri: '', //the access token uri of service provider in oauth2
    providerLogoutUri: '', //the access token uri of service provider in oauth2
    client_id: '', //the client id in oauth2, which needs to be applied from service provider
    client_secret: '', //the client secret in oauth2, which needs to be applied from service provider
    clientHost: '', //the client host url (your website host url)
    clientCallbackUri: '',//the client callback uri which is used to accept access token, user id and other authorized information
    clientLogoutReturnUrl: ''//the client side url which is used to return after logout from service provider side
};

var _extend = function (target, source) {
    for (var key in source) {
        target[key] = source[key];
    }
};

var OAuthClient = function (options) {
    options = options || {};
    _extend(this, options);
};

_extend(OAuthClient.prototype, defaultConfig);

// 拼出“用户中心”登录地址
OAuthClient.prototype.getAuthorizeUrl = function (returnUrl) {
    var qs = {
        scope: 'login',
        response_type: 'code',
        client_id: this.client_id, // 申请的clientID
        redirect_uri: this.clientHost + this.clientCallbackUri, // 指定回调地址
        state: uuid.v1(), // 不重复字串
        returnUrl: (returnUrl == undefined) ? "" : returnUrl // 登录成功后的跳转地址
    };
    return this.providerHost + this.providerAuthorizeUri + '?' + (querystring.stringify(qs));
};

// 重定向到 http://testu2.staff.xdf.cn/i/v2/index.aspx “用户中心”登陆地址
OAuthClient.prototype.getAuthorizationCode = function (req, res, next) {
    res.writeHead(303, {Location: this.getAuthorizeUrl()});
    res.end();
};

// 在“用户中心”通过socket方式执行的回调
OAuthClient.prototype.getAccessToken = function (req, res, next) {
    request({
        method: 'post',
        url: this.providerHost + this.providerAccessTokenUri,
        form: {
            client_id: this.client_id, // 申请的 client_id
            client_secret: this.client_secret, // 申请的 client_secret
            redirect_uri: this.clientHost + this.clientCallbackUri, // 指定回调地址
            state: req.query.state, // 传递过来的state数据
            code: req.query.code, // 自带的code数据
            grant_type: 'authorization_code',
            method: 'GetAccessToken'
        }
    }, function (err, resp, ret) {
        if (err) {
            console.error(ret.Message);
            next();
            return;
        }
        console.log('--------------->登录返回信息:');
        console.log(ret);

        ret = JSON.parse(ret);
        if (ret.Status === 1) {
            req.oauth = JSON.parse(ret.Data);
            next();
        } else {
            console.error(ret);
            next();
        }
    });
    return;
};

// 跳转到 http://testu2.staff.xdf.cn/Logout.aspx，从“用户中心”退出
OAuthClient.prototype.logout = function (res) {
    var qs = {
        ClientId: this.client_id,
        ReturnUrl: this.clientLogoutReturnUrl
    };
    return res.redirect(this.providerHost + this.providerLogoutUri + '?' + (querystring.stringify(qs)));
};

// 检测Cookie中是否存在key为U2Token的值，true 存在，false 不存在
OAuthClient.prototype.existedU2Token = function (req) {
    console.log('req.cookies.U2Token:' + req.cookies.U2Token);
    return (req.cookies.U2Token == undefined) ? false : true;
};

module.exports = OAuthClient;
