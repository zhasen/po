var UserService = require('../services/UserService');

var _extend = function (target, source) {
    for (var key in source) {
        target[key] = source[key];
    }
};
var defaults = {
    userKey: 'user', //user's key name in session
    returnUrlKey: 'returnUrl', //returnUrl's key name in session
    jumpOutView: 'jump', //the rendered view name which is used to jump out from iframe after login
    defaultReturnUrl: '/',
    loginUri: '/auth/login',
    callbackUri: '/auth/callback',
    logoutUri: '/auth/logout',
    oauthClient: null, //oauth client which need to be injected
    authRouteRe: /.*/ //by default, check all url for authentication
};

var Authenticator = function (options) {
    _extend(this, defaults);
    _extend(this, options || {});
};

Authenticator.prototype = {
    authenticated: function (req) {
        return req.session && req.session[this.userKey];
    },
    clearAuthentication: function (req) {
        req.session[this.userKey] = null;
    },
    setAuthentication: function (req, user) {
        req.session[this.userKey] = {
            id: user.id,
            displayName: user.displayName,
            email: user.email
        };
        return req.session[this.userKey];
        //console.log(req.session);
    },
    saveReturnUrl: function (req) {
        var originalUrl = req.protocol + '://' + req.get('host') + (this.context == '/' ? '' : this.context) + req.originalUrl;
        req.session[this.returnUrlKey] = originalUrl;
    },
    getReturnUrl: function (req, res) {
        var returnUrl;
        if (returnUrl && req.session) {
            returnUrl = req.session[this.returnUrlKey];
            req.session[this.returnUrlKey] = null;
        }
        else {
            returnUrl = this.defaultReturnUrl;
        }
        return returnUrl;
    },
    redirectReturnUrl: function (req, res) {
        res.redirect(this.getReturnUrl(req, res));
    },
    bind: function (app) {
        app.get(this.loginUri, this.login.bind(this));
        app.get(this.logoutUri, this.logout.bind(this));
        app.get(this.jumpUri, this.jumpOut.bind(this));
        app.get(this.callbackUri, this.oauthCallback.bind(this), this.signUpOrIn.bind(this), this.jumpOut.bind(this));
        app.all(this.authRouteRe, this.check.bind(this));
    },
    login: function (req, res, next) {
        this.oauthAuthorize(req, res, next);
    },
    oauthAuthorize: function (req, res, next) {
        this.oauthClient.getAuthorizationCode(req, res, next);
    },
    oauthCallback: function (req, res, next) {
        this.oauthClient.getAccessToken(req, res, next);
    },
    afterLogin: function (user, next) {
        next();
    },
    signUpOrIn: function (req, res, next) {
        var loginInfo = req.oauth;
        var auth = this;
        UserService.loadById(loginInfo.userId, function (err, user) {
            if (err) {
                throw err; //TODO:
                return;
            }

            if (!user) {
                var userJson = {
                    id: loginInfo.userId,
                    displayName: loginInfo.nickName,
                    email: loginInfo.email,
                    accessToken: loginInfo.access_token,
                    refreshToken: loginInfo.refresh_token,
                    expiresIn: loginInfo.expires_in
                };
                UserService.createFromOAuth(userJson, function (err, user) {
                    if (err) {
                        throw err; //TODO:
                        return;
                    }
                    var userInfo = auth.setAuthentication(req, user);
                    auth.afterLogin(userInfo, function () {
                        //auth.redirectReturnUrl(req, res);//use jump page to redirect
                        next();
                    });
                });
            }
            else {
                var userInfo = auth.setAuthentication(req, user);
                auth.afterLogin(userInfo, function () {
                    //auth.redirectReturnUrl(req, res);////use jump page to redirect
                    next();
                });
            }
        });
    },
    jumpOut: function (req, res, next) {
        res.render(this.jumpOutView, {returnUrl: this.getReturnUrl(req, res)});
    },
    logout: function (req, res, next) {
        this.clearAuthentication(req);
        this.oauthClient.logout(res);
    },
    check: function (req, res, next) {
        if (this.authenticated(req)) {
            next();
        }
        else {
            this.saveReturnUrl(req);
            this.oauthAuthorize(req, res, next);
        }
    }
};

module.exports = Authenticator;