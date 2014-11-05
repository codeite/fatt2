var express = require('express');
var request = require('request');



module.exports = function(config) {
  var router = express.Router();
  var freeagent = require('../services/freeagent')(config);

  router.get('/*', function(req, res) {
    var path = req.path
    console.log('path:', path)
    var query = req.query;
    var url = config.freeagentApi+path

    if(Array.isArray(query) && query.length > 0) {
      url += '?'

      for(var i in query) {
        url += (i + "=" + query[i] + "&")
      }
    }

    console.log("GET: "+url)

    var authToken = req.cookies.access_token

    console.log("Auth: "+authToken)
    freeagent.apiGet(authToken, url,
      function (error, response, body) {
          //if (!error && response.statusCode == 200) {
              //console.log('body', body)
          //}
          res.send(body);
      }
    );
  });

  router.post('/*', function(req, res) {
    var path = req.path
    console.log('path:', path)
    var query = req.query;
    var url = config.freeagentApi+path

    if(Array.isArray(query) && query.length > 0) {
      url += '?'

      for(var i in query) {
        url += (i + "=" + query[i] + "&")
      }
    }

    console.log("POST: "+url)

    var authToken = req.cookies.access_token

    console.log("Auth: "+authToken)
    console.log(req.body)

    freeagent.apiPost(authToken, url, JSON.stringify(req.body),
       function (error, response, body) {
           //if (!error && response.statusCode == 200) {
               //console.log('body', body)
           //}
           res.send("");
       }
    );
  });

  return router;
}
