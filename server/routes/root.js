var express = require('express');

module.exports = function (context) {
  var router = express.Router();

  var readUser = require('../middleware/readUser.js')(context);
  router.use(readUser);

  router.get('/config', function(req, res) {
    res.send(JSON.stringify(config));
  });

  router.get('/add-ts', function(req, res) {
    res.render('add-ts');
  });

  function registerRoute(path, script) {
    router.use(path, require('./'+script)(path, context));
  }

  // Routes
  registerRoute('/',            'index');
  registerRoute('/users',       'users');
  registerRoute('/freeagent',   'freeagentRoutes');
  registerRoute('/faauth',      'faAuth');
  registerRoute('/googleauth',  'googleAuth');
  registerRoute('/sign',        'sign');
  registerRoute('/data',        'data');

  return router;
}
