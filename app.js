var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('./lib/logger').getLogger('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var config = require('./config');
var Session = require('express-session');
//var mongoose = require('./lib/mongoose');
//
//var MongoStore = require('connect-mongo')(Session);
//var sessionStore = new MongoStore({
//    mongooseConnection: mongoose.connection
//});
var sessionStore = new Session.MemoryStore();
var app = express();
var AuthError = require('./models/user').AuthError;

var session = Session({
    secret: config.get('session:secret'),
    resave: false,
    saveUninitialized: true,
    //cookie: { secure: true },
    store: sessionStore
});

var options = config.get('production')? {
  setHeaders: function (res, path, stat) {
    res.setHeader('Cache-Control', 'public, max-age=' + config.get('cacheExpireTimeSecs'));
  }
} : {};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public'), options));
app.use(session);
app.use(compression());


app.use(function(req, res, next){
    logger.info(req.method, req.url);
    next();
});

require('./routes')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
app.use(function(err, req, res, next) {

    if(err instanceof AuthError ||  (app.get('env') === 'production')) {
        res.status(403);
        res.send({
            message: err.message,
            error: {}
        });
    } else {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    }
});


module.exports.app = app;
module.exports.session = session;
