module.exports = function (path, context) {
  'use strict';
  var config = context.config;
  var express = require('express');
  var router = express.Router();
  var storage = require('../services/storage')(context);

  var callbackUrl = config.siteName + context.root + path + "/callback";

  var oauth2 = require('simple-oauth2')({
    clientID: config.freeagent.fattClientId,
    clientSecret: config.freeagent.fattClientSecret,
    site: config.freeagent.apiUrl,
    authorizationPath: '/approve_app',
    tokenPath: '/token_endpoint',
  });

  // Authorization uri definition
  var authorizationUri = oauth2.authCode.authorizeURL({
    'redirect_uri': callbackUrl,
    'scope': 'full',
    'state': '0'
  });


  // Callback service parsing the authorization token and asking for the access token
  router.get('/callback', function (req, res) {
    var code = req.query.code;
    console.log('/callback');
    console.log(code);

    function saveToken(error, result) {
      var accessTokenKey = 'access_token';
      var refreshTokenKey = 'refresh_token';

      if (error) { console.log('Access Token Error', error); res.send("Failed"); return; }
      console.log(result);
      var token = oauth2.accessToken.create(result);
      console.log(token);

      var access_token = token.token[accessTokenKey];
      var expires_in = token.token[accessTokenKey];
      var expiresAt = Math.round((new Date()).getTime() / 1000) + expires_in - 3600;
      var refresh_token = token.token[refreshTokenKey];

      if(req.user) {
        storage.setUserToken(req.user, access_token, expiresAt, refresh_token, function(){
          res.redirect(context.root);
        });
      } else {
        res.cookie(accessTokenKey, token.token[accessTokenKey], { maxAge: 604800000, path: context.root });
      }
    }

    oauth2.authCode.getToken({
      'code': code,
      'redirect_uri': callbackUrl
    }, saveToken);

  });

  /* GET users listing. */
  router.get('/', function(req, res) {
    if(req.user) {
      res.redirect(authorizationUri);
    } else {
      res.redirect( context.root + 'sign');
    }
  });

  router.get('/token', function(req, res) {

    if(!req.user){
      res.send("Not logged in");
      return;
    }

    storage.getUserToken(req.user, function(token) {
      res.send('Here would be the token: ' + token);
    });
  });

  return router;
};
/*












*/
