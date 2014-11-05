module.exports = function(config) {
  var request = require('request')
  var fs = require('fs')
  var path = require('path');

  var apiGet = function(authToken, url, callback) {
    request.get(
      url,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'node.js',
          'Authorization': 'Bearer '+authToken
        }
      },
      function(error, response, body) {
        if(error) {
          var jsonFile = "";
          if(url.indexOf('/v2/timeslips') != -1){
            jsonFile = 'timeslips.json'
          } else if(url.indexOf('/v2/projects') != -1){
            jsonFile = 'projects.json'
          } else {
            console.log('Cant find a file for '+url)
          }

          var pathToJson = path.join(__dirname, '../data', jsonFile);
          console.log(pathToJson)

          fs.readFile(pathToJson, function(error, data){
            callback(error, response, replaceRemoteWithLocal(data))
          });
        } else {
          callback(error, response, replaceRemoteWithLocal(body))
        };
      }
    );
  };

  var apiPost = function(authToken, url, body, callback){
    var fixedBody = replaceLocalWithRemote(body);
    var options = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'node.js',
        'Authorization': 'Bearer '+authToken
      },
      body: fixedBody
    };


    request.post(url, options, function(error, response, body){
      console.log("Response to POST: ", body);
      callback(error, response, body);
    })
  }

  var apiDelete = function(authToken, url, callback) {

    if(url.indexOf('timeslip') == -1) {
      console.log("Can only delete timeslips");
      callback("Can only delete timeslips", null, null);
      return;
    }

    var options = {
      headers: {
        'User-Agent': 'node.js',
        'Authorization': 'Bearer '+authToken
      }
    };

    console.log("About to delete", url)
    request.del(url, options, function(error, response, body){
      console.log("Response to DELETE: ", body);
      callback(error, response, body);
    });
  }

  var replaceRemoteWithLocal = function(body) {
    var regex = new RegExp(config.freeagentApi, 'g');
    console.log('replacing', regex, config.siteName+"/freeagent")

    return (body+"").replace(regex, config.siteName+"/freeagent")
  }

  var replaceLocalWithRemote = function(body) {
    var regex = new RegExp(config.siteName+"/freeagent", 'g');
    var replace = config.freeagentApi;

    console.log('replacing', regex, replace)
    return (body+"").replace(regex, replace)
  }

  return {
    apiGet: apiGet,
    apiPost: apiPost,
    apiDelete: apiDelete,
  };
};
