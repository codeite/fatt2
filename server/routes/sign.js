module.exports = function (path, context) {
  'use strict';

  var express = require('express');
  var router = express.Router();


  router.get('/', function (req, res) {

    var user = req.user || "";

    if(user !== "") {
      res.redirect(context.root);
    } else {
      res.redirect(req.originalUrl + '/in');
    }

  });

  /* GET home page. */
  router.get('/in', function(req, res) {
    res.render('signin');

  });

  return router;
};
