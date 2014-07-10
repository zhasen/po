var logger = require('../commons/logging').logger;
var handle500 = function (err, req, res, next) {
    if (err.status) res.statusCode = err.status;
    if (res.statusCode < 400) res.statusCode = 500;

    var msg = {
        errorCode: err.code || 'unknown',
        errorMessage: err.message,
        errorStack: (err.stack || ''),
        statusCode: res.statusCode,
        url: req.url
    };
    logger.error('request 500: ' + JSON.stringify(msg));

    if (req.accepts('html')) {// respond with html page
        res.render('500', msg);
    }
    else if (req.accepts('json') || req.xhr) {// respond with json
        res.json(200, msg);
    }
    else{
        res.writeHead(res.statusCode, { 'Content-Type': 'text/plain' });
        res.end(msg);
    }
};

var handle404 = function(req, res, next){
    res.status(404);

    var msg = {
        errorCode: 'not-found',
        errorMessage: 'Resource '+req.url+' is not found',
        statusCode: 404,
        url: req.url
    };
    logger.error('request 404: ' + JSON.stringify(msg));

    if (req.accepts('html')) {// respond with html page
        res.render('404', msg);
        return;
    }

    if (req.accepts('json')) {// respond with json
        res.send(msg);
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
};

var enable = function(app){
    var mode = app.get('env') || 'development';
    if ('development' == mode) {
        app.use(require('express').errorHandler());
    }
    else{
        app.use(handle500);
        app.use(handle404);
    }
};

module.exports = enable;