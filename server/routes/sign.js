module.exports = function (path, config){
  'use strict';
  var express = require('express');
  var router = express.Router();
  var authauth = require('../services/authauth')(config);

  router.get('/', function (req, res) {

    var user = authauth.verifyToken(req.cookies.authauth);

    if(user !== "") {
      res.redirect('/');
    } else {
      res.redirect(path+'/in');
    }

  });

  /* GET home page. */
  router.get('/in', function(req, res) {
    res.render('signin');

  });

  return router;
};
