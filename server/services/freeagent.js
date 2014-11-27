module.exports = function (config) {
  'use strict';
  var request = require('request'),
    fs = require('fs'),
    path = require('path');

  var apiGet = function (authToken, url, callback) {
    var cachedResponse = config.cache.get(url)[url];

    var headers = {
      'Accept': 'application/json',
      'User-Agent': 'node.js',
      'Authorization': 'Bearer ' + authToken
    };

    if (cachedResponse) {
      console.log("Found this in the cache:", cachedResponse.etag);
      headers['If-none-match'] = cachedResponse.etag;
    } else {
      console.log("Not in cache");
    }

    var whenDone = function (error, response, body, callback) {
      for (var key in response.headers) { if(response.headers.hasOwnProperty(key)) {
        response.headers[key] = replaceRemoteWithLocal(
        response.headers[key]);
      }}

      callback(error, response, replaceRemoteWithLocal(body));
    };

    var getCallback = function (error, response, body) {
      if (error) {
        var jsonFile = "";
        if (url.indexOf('/v2/timeslips') !== -1) {
          jsonFile = 'timeslips.json';
        } else if (url.indexOf('/v2/projects') !== -1) {
          jsonFile = 'projects.json';
        } else {
          console.log('Cant find a file for ' + url);
        }

        var pathToJson = path.join(__dirname, '../data',
          jsonFile);
        console.log(pathToJson);

        fs.readFile(pathToJson, function (error, data) {
          callback(error, response,
            replaceRemoteWithLocal(data)
          );
        });
      } else {

        if (response.statusCode === 200) {
          config.cache.set(url, {
            etag: response.headers.etag,
            response: response,
            body: body
          });

          whenDone(error, response, body, callback);
        } else if (response.statusCode === 304) {
          console.log("Using cached response");
          whenDone(null, cachedResponse.response,
            cachedResponse.body, callback);
        }
      }
    };

    request.get(url, { headers: headers }, getCallback);
  };

  var apiPost = function (authToken, url, body, callback) {
    var fixedBody = replaceLocalWithRemote(body);
    var options = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'node.js',
        'Authorization': 'Bearer ' + authToken
      },
      body: fixedBody
    };

    request.post(url, options, function (error, response, body) {
      console.log("Response to POST: ", body);
      callback(error, response, body);
    });
  };

  var apiDelete = function (authToken, url, callback) {

    if (url.indexOf('timeslip') === -1) {
      console.log("Can only delete timeslips");
      callback("Can only delete timeslips", null, null);
      return;
    }

    var options = {
      headers: {
        'User-Agent': 'node.js',
        'Authorization': 'Bearer ' + authToken
      }
    };

    console.log("About to delete", url);
    request.del(url, options, function (error, response, body) {
      console.log("Response to DELETE: ", body);
      callback(error, response, body);
    });
  };

  var replaceRemoteWithLocal = function (body) {
    var regex = new RegExp(config.freeagent.apiUrl, 'g');
    //console.log('replacing', regex, config.siteName+"/freeagent")

    return (body + "").replace(regex, config.siteName + "/freeagent");
  };

  var replaceLocalWithRemote = function (body) {
    var regex = new RegExp(config.siteName + "/freeagent", 'g');
    var replace = config.freeagentApi;

    //console.log('replacing', regex, replace)
    return (body + "").replace(regex, replace);
  };

  return {
    apiGet: apiGet,
    apiPost: apiPost,
    apiDelete: apiDelete,
  };
};
