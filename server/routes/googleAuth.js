module.exports = function (path, config){
  'use strict';
  var express = require('express');
  var router = express.Router();

  var authauth = require('../services/authauth')(config);
  var storage = require('../services/storage')(config);

  var state = Math.random()+"fth";

  var callbackUrl = config.siteName + path + "/callback";

  var oauth2 = require('simple-oauth2')({
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret,
    site: config.google.apiUrl,
    authorizationPath: '/auth',
    tokenPath: '/token',
  });

  // Authorization uri definition
  var authorizationUri = oauth2.authCode.authorizeURL({
    'redirect_uri': callbackUrl,
    'scope': 'openid email',
    'state': state
  });

  function base64urlDecode(str) {
  return new Buffer(base64urlUnescape(str), 'base64').toString();
  }

  function base64urlUnescape(str) {
    str += new Array(5 - str.length % 4).join('=');
    return str.replace(/\-/g, '+').replace(/_/g, '/');
  }


  // Callback service parsing the authorization token and asking for the access token
  router.get('/callback', function (req, res) {
    var code = req.query.code;
    console.log('Callback from google');
    console.log(req.query);

    function saveToken(error, result) {
      var accessTokenKey = 'access_token';
      var idTokenKey = 'id_token';

      if (error) { console.log('Access Token Error', error); res.send("Failed"); return; }
      console.log(result);
      var token = oauth2.accessToken.create(result);
      console.log("token: ", token);
      // res.cookie(accessTokenKey, token.token[accessTokenKey], { maxAge: 604800000, path: '/' });
      // res.cookie(refreshTokenKey, token.token[refreshTokenKey], { maxAge: 604800000, path: '/' });

      var bits = token.token[idTokenKey].split('.');

      // decode
      var payload = JSON.parse(base64urlDecode(bits[1]));
      console.log(payload); //=> { foo: 'bar' }

      storage.saveUser(payload.email, token.token[accessTokenKey], payload, function (err, result){
        //res.send(JSON.stringify(payload));
        var token = authauth.generateToken(payload.email);
        console.log('token', token);
        res.cookie('authauth', token, { maxAge: 900000, httpOnly: true });
        res.redirect('/sign');
      });
      //res.redirect('/');
    }

    oauth2.authCode.getToken({
      'code': code,
      'redirect_uri': callbackUrl
    }, saveToken);

  });

  /* GET users listing. */
  router.get('/', function(req, res) {
    res.redirect(authorizationUri);
  });

  return router;
};
