var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Cookies = require( "cookies" )
var cookieParser = require('cookie-parser')
var request = require('request');


var routes = require('./routes/index');
var users = require('./routes/users');
var freeagentRoutes = require('./routes/freeagentRoutes');

var app = express();

app.use(cookieParser())

var port = (process.env.PORT || 4848);
app.set('port', port)
var fattClientId = (process.env.FATT_CLIENT_ID || "ZnVY2G0fN-ZzL0-XBi7L_g");
var fattClientSecret = (process.env.FATT_CLIENT_SECRET || "4OdDfW36ONBQug4Y2_3lDw");
var freeagentApi = (process.env.FREEAGENT_API || "https://api.sandbox.freeagent.com/v2");
var siteName = (process.env.SITE_NAME || "http://localhost");

var callbackUrl = siteName+':'+port+'/callback'

var oauth2 = require('simple-oauth2')({
  clientID: fattClientId,
  clientSecret: fattClientSecret,
  site: freeagentApi,
  authorizationPath: '/approve_app',
  tokenPath: '/token_endpoint',
});

// Authorization uri definition
var authorization_uri = oauth2.authCode.authorizeURL({
  redirect_uri: callbackUrl,
  scope: 'notifications',
  state: '0'
});

// Initial page redirecting to FreeAgent
app.get('/auth', function (req, res) {
    res.redirect(authorization_uri);
});

app.get('/config', function(req, res) {
  res.send('{ "port": ' + port + '}')
})

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', function (req, res) {
  var code = req.query.code;
  console.log('/callback');
  console.log(code);

  oauth2.authCode.getToken({
    code: code,
    redirect_uri: callbackUrl
  }, saveToken);

  function saveToken(error, result) {
    if (error) { console.log('Access Token Error', error); res.send("Failed"); return; }
    console.log(result)
    token = oauth2.accessToken.create(result);
    console.log(token)
    res.cookie('access_token', token.token.access_token, { maxAge: 604800000, path: '/' });
    res.cookie('refresh_token', token.token.refresh_token, { maxAge: 604800000, path: '/' });
    res.send('passed')
  }

});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', routes);
app.use('/users', users);
app.use('/freeagent', freeagentRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(port)
console.log("App listening on port "+port)

module.exports = app;
