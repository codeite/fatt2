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

    mongodbUrl : (process.env.MONGO_DB_URL || "mongodb://fatt-website:LlQHuBH6gAnzHdj@ds033170.mongolab.com:33170/fatt"),

    freeagent: {
      fattClientId: (process.env.FREEAGENT_FATT_CLIENT_ID || "ZnVY2G0fN-ZzL0-XBi7L_g"),
      fattClientSecret: (process.env.FREEAGENR_FATT_CLIENT_SECRET || "4OdDfW36ONBQug4Y2_3lDw"),
      apiUrl: (process.env.FREEAGENT_API_URL || "https://api.sandbox.freeagent.com/v2"),
    },

    google: {
      clientId: (process.env.GOOGLE_CLIENT_ID || "121875671159-tggl2f47e171usdatcn4fnpeabkc6f76.apps.googleusercontent.com"),
      clientSecret: (process.env.GOOGLE_CLIENT_SECRET || "TEW03Pw8qcWFXwy0qIAFHWdy"),
      apiUrl: (process.env.GOOGLE_API_URL || "https://accounts.google.com/o/oauth2")
    },

    siteName: (process.env.SITE_NAME || "http://localhost:4848"),
    secret: "this is a secret",
    cache: myCache

  };

  var app = express();

  app.set('port', config.port);
  app.use(cookieParser());

  app.get('/config', function(req, res) {
    res.send(JSON.stringify(config));
  });

  app.get('/add-ts', function(req, res) {
    res.render('add-ts');
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

  function registerRoute(path, script) {
    app.use(path, require('./routes/'+script)(path, config));
  }

  // Routes
  registerRoute('/',            'index');
  registerRoute('/users',       'users');
  registerRoute('/freeagent',   'freeagentRoutes');
  registerRoute('/faauth',      'faAuth');
  registerRoute('/googleauth',  'googleAuth');
  registerRoute('/sign',        'sign');


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
