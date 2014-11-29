module.exports = function (path, config){
  'use strict';
  var express = require('express');
  var router = express.Router();
  var authauth = require('../services/authauth')(config);

  router.get('/', function (req, res) {

    var user = authauth.verifyToken(req.cookies.authauth);

    if(user === "") {
      console.log ("At: / User is not logged in");
      res.redirect('/sign');
    } else {
      console.log ("At: / User is logged in");
      res.redirect('/month');
    }


  });

  /* GET home page. */
  router.get('/month', function(req, res) {
    res.render('month');
  });

  return router;
};
