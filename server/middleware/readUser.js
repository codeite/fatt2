module.exports = function (context) {
  'use strict';

  var authauth = require('../services/authauth')(context);

  return function(req, res, next) {
    var token = req.cookies.authauth || req.query.authauth;

    if(typeof(token) === 'string' && token !== '') {
      req.user = authauth.verifyToken(token);
    }

    next();
  };
};
