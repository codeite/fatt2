module.exports = function (path, config){
  'use strict';
  var express = require('express');
  var router = express.Router();
  var authauth = require('../services/authauth')(config);

  router.get('/', function (req, res) {

    res.end(authauth.verifyToken(req.cookies.authauth));
    //res.redirect(path+'/in');
  });

  /* GET home page. */
  router.get('/in', function(req, res) {
    res.render('signin');

  });

  return router;
};
