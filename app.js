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

var app = express();

app.use(cookieParser())

var port = 4848;
process.env.DEBUG = true
var callbackUrl = 'http://localhost:'+port+'/callback'

var oauth2 = require('simple-oauth2')({
  clientID: "ZnVY2G0fN-ZzL0-XBi7L_g",
  clientSecret: "4OdDfW36ONBQug4Y2_3lDw",
  site: 'https://api.sandbox.freeagent.com/v2',
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
    res.cookie('access_token', token.token.access_token, { maxAge: 3600000, path: '/' });
    res.cookie('refresh_token', token.token.refresh_token, { maxAge: 3600000, path: '/' });
    res.send('passed')
  }

});

app.get('/api/freeagent/*', function(req, res) {
  var path = req.path.substr('/api/freeagent'.length);
  var query = req.query;
  var url = 'https://api.sandbox.freeagent.com/v2'+path

  if(query) {
    url += '?'

    for(var i in query) {
      url += (i + "=" + query[i] + "&")
    }

  }

  console.log("GET: "+url)

  var authToken = req.cookies.access_token

  console.log("Auth: "+authToken)
  request.get(
    url,
    {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'node.js',
        'Authorization': 'Bearer '+authToken
      }
    },
    function (error, response, body) {
        //if (!error && response.statusCode == 200) {
            console.log('body', body)
        //}
        res.send(response.body);
    }
);
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
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

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
