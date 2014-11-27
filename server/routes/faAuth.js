module.exports = function (path, config){
  'use strict';
  var express = require('express');
  var router = express.Router();

  var callbackUrl = config.siteName + path + "/callback";

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
      res.cookie(accessTokenKey, token.token[accessTokenKey], { maxAge: 604800000, path: '/' });
      res.cookie(refreshTokenKey, token.token[refreshTokenKey], { maxAge: 604800000, path: '/' });
      res.redirect('/');
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
/*












*/
