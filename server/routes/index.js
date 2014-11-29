module.exports = function (path, config){
  'use strict';
  var express = require('express');
  var router = express.Router();

  router.get('/', function (req, res) {
    res.redirect('/sign');
  });

  /* GET home page. */
  router.get('/month', function(req, res) {
    res.render('month');
  });

  return router;
};
