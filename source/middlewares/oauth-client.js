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

OAuthClient.prototype.getAuthorizeUrl = function () {
    var qs = {
        scope: 'login',
        response_type: 'code',
        client_id: this.client_id,
        redirect_uri: this.clientHost + this.clientCallbackUri,
        state: uuid.v1()
    };
    return this.providerHost + this.providerAuthorizeUri + '?' + (querystring.stringify(qs));
};
OAuthClient.prototype.getAuthorizationCode = function (req, res, next) {
    res.writeHead(303, {Location: this.getAuthorizeUrl()});
    res.end();
};
OAuthClient.prototype.getAccessToken = function (req, res, next) {
    request({
        method: 'post',
        url: this.providerHost + this.providerAccessTokenUri,
        form: {
            client_id: this.client_id,
            client_secret: this.client_secret,
            redirect_uri: this.clientHost + this.clientCallbackUri,
            state: req.query.state,
            code: req.query.code,
            grant_type: 'authorization_code',
            method: 'GetAccessToken'
        }
    }, function (err, resp, ret) {
        if(err){
            console.error(ret.Message);
            next();
            return;
        }

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

OAuthClient.prototype.logout = function (res) {
    var qs = {
        ClientId: this.client_id,
        ReturnUrl: this.clientLogoutReturnUrl
    };
    return res.redirect(this.providerHost + this.providerLogoutUri + '?' + (querystring.stringify(qs)));
};

module.exports = OAuthClient;
