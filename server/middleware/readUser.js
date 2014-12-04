module.exports = function (config) {
  'use strict';

  var authauth = require('../services/authauth')(config);

  return function(req, res, next) {
    var token = req.cookies.authauth;

    if(typeof(token) === 'string' && token !== '') {
      req.user = authauth.verifyToken(token);
    }

    next();
  };
};
