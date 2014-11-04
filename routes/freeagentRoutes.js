var express = require('express');
var router = express.Router();
var request = require('request');

var freeagent = require('../services/freeagent');


router.get('/*', function(req, res) {
  var path = req.path
  console.log('path:', path)
  var query = req.query;
  var url = 'https://api.sandbox.freeagent.com/v2'+path

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


module.exports = router;
