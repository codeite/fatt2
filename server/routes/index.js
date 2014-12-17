module.exports = function (path, context) {
  'use strict';
  var express = require('express');
  var router = express.Router();
  var demand = require('../middleware/demand')(context);


  router.get('/', demand("fa"), function (req, res) {

    if(req.user === "") {
      console.log ("At: / User is not logged in");
      res.redirect('/sign');
    } else {
      console.log ("At: / User is logged in");
      res.redirect('/month');
    }


  });

  /* GET home page. */
  router.get('/month', demand("fa"), function(req, res) {



    res.render('month');
  });

  return router;
};
