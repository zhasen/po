  var uuid = require('uuid');
  var request = require('request');
  var querystring = require('querystring');

  //TODO: Use settings
  var xdfPassport = {
      host: 'http://testu2.staff.xdf.cn',
      accessTokenUri: '/apis/OAuth.ashx',
      logoutUri: '/Logout.aspx',
      returnUrl: '/logout',
      ssoLogoutUri: '/sso_logout'
  };

  var _extend = function(target, source){
      for (var key in source) {
          target[key] = source[key];
      }
  };
  var XDF = function(options) {
      options = options || {};
      _extend(this, options);
  };

  _extend(XDF.prototype, xdfPassport);

  XDF.prototype.getAuthorizeUrl = function () {
      var qs = {
          scope: 'login',
          response_type: 'code',
          client_id: this.client_id,
          redirect_uri: this.redirect_url,
          state: uuid.v1()
      };
      return "" + this.host + "?" + (querystring.stringify(qs));
  };

  XDF.prototype.getAccessToken = function (query, callback) {
      return request({
          method: 'post',
          url: "" + this.host + this.accessTokenUri,
          form: {
              client_id: this.client_id,
              client_secret: this.client_secret,
              redirect_uri: this.redirect_url,
              state: query.state,
              code: query.code,
              grant_type: 'authorization_code',
              method: 'GetAccessToken'
          }
      }, function (err, resp, ret) {
          ret = JSON.parse(ret);
          if (ret.Status === 1) {
              return callback(err, JSON.parse(ret.Data));
          } else {
              return callback(new Error(ret.Message));
          }
      });
  };

  XDF.prototype.logout = function (res) {
      var qs = {
          ClientId: this.client_id,
          ReturnUrl: this.returnUrl
      };
      return res.redirect("" + this.host + this.logoutUri + "?" + (querystring.stringify(qs)));
  };

  exports.oauth = function (options) {
      var xdf;
      if (options == null) {
          options = {};
      }
      options.authorizeUri || (options.authorizeUri = '/login');
      options.redirectUri || (options.redirectUri = '/u2/callback');
      options.refer || (options.refer = 'xdf');
      options.afterSuccess || (options.afterSuccess = function (token, req, res) {
          return res.json(token);
      });
      xdf = new XDF(options);
      return function (req, res, next) {
          var temp = req.path;
          switch (req.path) {
              case xdf.authorizeUri:
                  res.writeHead(303, {
                      Location: xdf.getAuthorizeUrl()
                  });
                  return res.end();
              case xdf.redirectUri:
                  return xdf.getAccessToken(req.query, function (err, ret) {
                      return options.afterSuccess(ret, req, res);
                  });
              case xdf.ssoLogoutUri:
                  return xdf.logout(res);
              default:
                  return next();
          }
      };
  };
