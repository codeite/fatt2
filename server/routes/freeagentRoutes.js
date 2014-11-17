var express = require('express');
var request = require('request');



module.exports = function(config) {
  var router = express.Router();
  var freeagent = require('../services/freeagent')(config);

  router.get('/*', function(req, res) {
    var path = req.path
    var query = req.query;
    var url = config.freeagentApi+path

    if(typeof(query) == 'object') {
      url += '?'

      var bits = []
      for(var i in query) {
        bits.push(i + "=" + query[i])
      }
      url += bits.join("&");
    }

    console.log("GET: "+url)

    var authToken = req.cookies.access_token

    console.log("Auth: "+authToken)
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

  router.post('/*', function(req, res) {
    var path = req.path
    var query = req.query;
    var url = config.freeagentApi+path

    if(typeof(query) == 'object') {
      url += '?'

      var bits = []
      for(var i in query) {
        bits.push(i + "=" + query[i])
      }
      url += bits.join("&");
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

  router.delete('/*', function(req, res) {
    var path = req.path
    var query = req.query;
    var url = config.freeagentApi+path

    if(typeof(query) == 'object') {
      url += '?'

      var bits = []
      for(var i in query) {
        bits.push(i + "=" + query[i])
      }
      url += bits.join("&");
    }


    console.log("DELETE: "+url)

    var authToken = req.cookies.access_token

    console.log("Auth: "+authToken)
    console.log(req.body)

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
}
