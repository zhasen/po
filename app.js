require('./source/middlewares/initon')();
require('./source/middlewares/ensurenv')(__dirname);
var express = require('express')
    , http = require('http')
    , path = require('path')
    , engine = require('ejs-locals')
    , settings = require('./settings');

var app = module.exports = express();

//some common configuration
app.enable('trust proxy');

// all environments
app.locals(settings.resources);
app.set('port', process.env.PORT || settings.app.port);
app.set('views', __dirname + '/source/views');
app.set('view engine', 'ejs');
app.engine('ejs', engine);

var logging = require('./source/commons/logging');
var logger = logging.logger;
app.use(logging.applogger);
app.use(express.compress());
app.use(express.query());
app.use(express.bodyParser({ uploadDir: './'+settings.file.question }));
app.use(express.methodOverride());
app.use(express.cookieParser(settings.secretKey));
app.use(require('./source/middlewares/session')(express)); //set session middle-ware

var mode = app.get('env') || 'development';
if ('development' == mode) {
    app.use('/public', express.static(path.join(__dirname, 'public')));
    app.use('/web', express.static(path.join(__dirname, 'web')));
}
require('./source/routes')(app);
require('./source/middlewares/errorhandling')(app);

var server = http.createServer(app).listen(app.get('port'), settings.app.host, function(){
    logger.info('The server is listening on port ' + app.get('port') + ' in ' + mode );
});



//var recording = require('./source/middlewares/recording');
//recording(server);

var websocket = require('./source/middlewares/websocket');
websocket.init(server);
var interactiveClassroomDetailService = require('./source/services/InteractiveClassroomDetailService');
websocket.register(interactiveClassroomDetailService.ALLWSTYPE.classRoom,interactiveClassroomDetailService.dealFunc);
