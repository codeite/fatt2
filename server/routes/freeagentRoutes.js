module.exports = function (path, context) {
  'use strict';
  var config = context.config;

  var express = require('express'),
    router = express.Router(),
    freeagent = require('../services/freeagent')(context),
    storage = require('../services/storage')(context);

  var authCookieName = "access_token";

  var getToken = function (req, callback) {

    storage.getUserToken(req.user, function(token) {
      var now = Math.round((new Date()).getTime() / 1000)

      if (token && token.expiresAt < now) {
        return freeagent.refreshToken(req.user, token, function(newAccessToken) {
          callback(newAccessToken);
        })
      }

      if (token && token.expiresAt ) {
        console.log('Token has seconds to live:', token.expiresAt - now, token.expiresAt, now)
      }

      callback(token.accessToken || req.cookies[authCookieName]);
    });
  };

  var buildUrl = function (apiRoot, path, query){
    var url = apiRoot + path;

    if (typeof (query) === 'object') {
      url += '?';

      var bits = [];
      for (var i in query) { if(query.hasOwnProperty(i)) {
        bits.push(i + "=" + query[i]);
      }}
      url += bits.join("&");
    }

    return url;
  };

  router.get('/*', function (req, res) {
    var url = buildUrl(config.freeagent.apiUrl, req.path, req.query);
    console.log("GET: " + url);

    getToken(req, function(authToken) {
      console.log("Auth: " + authToken);

      freeagent.apiGet(authToken, url,
        function (error, response, body) {
          if (error || response.statusCode !== 200) {
            console.log('Error calling freeagent', error);
            res.status(response.statusCode);
            res.end();
            return;
          }
          res.set('link', response.headers.link || '');
          res.send(body);
        }
      );
    });
  });

  router.post('/*', function (req, res) {
    var url = buildUrl(config.freeagent.apiUrl, req.path, req.query);
    console.log("POST: " + url);

    getToken(req, function(authToken) {
      console.log("Auth: " + authToken);

      console.log(req.body);

      freeagent.apiPost(authToken, url, JSON.stringify(req.body),
        function (error, response, body) {
          //if (!error && response.statusCode == 200) {
          //console.log('body', body)
          //}
          res.send("");
        }
      );
    });
  });

  router.put('/*', function (req, res) {
    var url = buildUrl(config.freeagent.apiUrl, req.path, req.query);
    console.log("PUT: " + url);

    getToken(req, function(authToken) {
      console.log("Auth: " + authToken);

      console.log(req.body);

      freeagent.apiPut(authToken, url, JSON.stringify(req.body),
        function (error, response, body) {
          //if (!error && response.statusCode == 200) {
          //console.log('body', body)
          //}
          res.send("");
        }
      );
    });
  });

  router.delete('/*', function (req, res) {
    var url = buildUrl(config.freeagent.apiUrl, req.path, req.query);
    console.log("DELETE: " + url);

    getToken(req, function(authToken) {
      console.log("Auth: " + authToken);

      freeagent.apiDelete(authToken, url,
        function (error, response, body) {
          //if (!error && response.statusCode == 200) {
          //console.log('body', body)
          //}
          res.send("");
        }
      );
    });
  });

  return router;
};
