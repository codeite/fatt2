module.exports = (function (){
  'use strict';
  var express = require('express');
  var path = require('path');
  /*var favicon = */require('serve-favicon');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var NodeCache = require( "node-cache" );
  var cache = new NodeCache();

  var config = require('./config');

  var context = {
    config: config,
    cache: cache
  };

  var readUser = require('./middleware/readUser.js')(context);

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
  app.use(readUser);

  function registerRoute(path, script) {
    app.use(path, require('./routes/'+script)(path, context));
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
