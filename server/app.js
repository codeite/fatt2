module.exports = (function (){
  'use strict';
  var express = require('express');
  var path = require('path');
  /*var favicon = */require('serve-favicon');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var NodeCache = require( "node-cache" );
  var myCache = new NodeCache();

  var config = {
    port: (process.env.PORT || 4848),
    fattClientId: (process.env.FATT_CLIENT_ID || "ZnVY2G0fN-ZzL0-XBi7L_g"),
    fattClientSecret: (process.env.FATT_CLIENT_SECRET || "4OdDfW36ONBQug4Y2_3lDw"),
    freeagentApi: (process.env.FREEAGENT_API || "https://api.sandbox.freeagent.com/v2"),
    siteName: (process.env.SITE_NAME || "http://localhost:4848"),
    callbackUrl: (process.env.CALLBACK_URL || "http://localhost:4848/callback"),
    cache: myCache
  };

  var routes = require('./routes/index');
  var users = require('./routes/users');
  var freeagentRoutes = require('./routes/freeagentRoutes')(config);

  var app = express();

  app.set('port', config.port);
  app.use(cookieParser());

  var oauth2 = require('simple-oauth2')({
    clientID: config.fattClientId,
    clientSecret: config.fattClientSecret,
    site: config.freeagentApi,
    authorizationPath: '/approve_app',
    tokenPath: '/token_endpoint',
  });

  // Authorization uri definition
  var authorizationUri = oauth2.authCode.authorizeURL({
    'redirect_uri': config.callbackUrl,
    'scope': 'full',
    'state': '0'
  });

  // Initial page redirecting to FreeAgent
  app.get('/auth', function (req, res) {
    res.redirect(authorizationUri);
  });

  app.get('/config', function(req, res) {
    res.send(JSON.stringify(config));
  });

  app.get('/add-ts', function(req, res) {
    res.render('add-ts');
  });

  // Callback service parsing the authorization token and asking for the access token
  app.get('/callback', function (req, res) {
    var code = req.query.code;
    console.log('/callback');
    console.log(code);



    function saveToken(error, result) {
      var accessTokenKey = 'access_token';
      var refreshTokenKey = 'refresh_token';

      if (error) { console.log('Access Token Error', error); res.send("Failed"); return; }
      console.log(result);
      var token = oauth2.accessToken.create(result);
      console.log(token);
      res.cookie(accessTokenKey, token.token[accessTokenKey], { maxAge: 604800000, path: '/' });
      res.cookie(refreshTokenKey, token.token[refreshTokenKey], { maxAge: 604800000, path: '/' });
      res.redirect('/');
    }

    oauth2.authCode.getToken({
      'code': code,
      'redirect_uri': config.callbackUrl
    }, saveToken);

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

  app.listen(config.port);
  console.log("App listening on port "+config.port);

  return app;
})();
