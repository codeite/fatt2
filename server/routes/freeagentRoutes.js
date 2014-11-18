module.exports = function (config) {
  'use strict';

  var express = require('express'),
    router = express.Router(),
    freeagent = require('../services/freeagent')(config);

  var authCookieName = "access_token";

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
    var url = buildUrl(config.freeagentApi, req.path, req.query);
    console.log("GET: " + url);

    var authToken = req.cookies[authCookieName];
    console.log("Auth: " + authToken);

    freeagent.apiGet(authToken, url,
      function (error, response, body) {
        //if (!error && response.statusCode == 200) {
        //console.log('body', body)
        //}
        res.set('link', response.headers.link || '');
        res.send(body);
      }
    );
  });

  router.post('/*', function (req, res) {
    var url = buildUrl(config.freeagentApi, req.path, req.query);
    console.log("POST: " + url);

    var authToken = req.cookies[authCookieName];
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

  router.delete('/*', function (req, res) {
    var url = buildUrl(config.freeagentApi, req.path, req.query);
    console.log("DELETE: " + url);

    var authToken = req.cookies[authCookieName];
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

  return router;
};
