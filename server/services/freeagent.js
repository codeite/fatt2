module.exports = function (context, scope) {
  'use strict';
  var config = context.config;
  var cache = context.cache;

  var request = require('request');
  var Q = require('q');

  var storage = require('./storage')(context);

  var apiGet = function (authToken, options, callback) {
    var deferred = null;
    var url;

    if(typeof(options) == 'string'){
      options = {
        url: options,
        replaceWithLocal: true
      };
    }

    url = options.url;


    if(callback === undefined) {
      deferred = Q.defer();
      callback = function(error, response, body) {
        if (error) {
          deferred.reject(error);
        } else {
          deferred.resolve({
            authToken: authToken,
            response: response,
            body: body
          });
        }
      }
    }

    var cacheKey = authToken+'-'+url;
    //console.log("Looking in cache for:", cacheKey);
    var cachedResponse = cache.get(cacheKey)[cacheKey];

    var headers = {
      'Accept': 'application/json',
      'User-Agent': 'node.js',
      'Authorization': 'Bearer ' + authToken
    };

    if (cachedResponse) {
      //console.log("Found this in the cache:", cachedResponse.etag);
      headers['If-none-match'] = cachedResponse.etag;
    } else {
      //console.log("Not in cache");
    }

    var whenDone = function (error, response, body, callback) {
      if(options.replaceWithLocal) {
        for (var key in response.headers) {
          if (response.headers.hasOwnProperty(key)) {
            response.headers[key] = replaceRemoteWithLocal(
              response.headers[key]);
          }
        }
        body = replaceRemoteWithLocal(body);
      }

      callback(error, response, body);
    };

    var getCallback = function (error, response, body) {
      if(error) {
        throw error;
      }

      if (response.statusCode === 200) {
        if(cachedResponse) {
          console.log("Junking cached response");
        }

        //console.log("Setting cache value: ", cacheKey);
        cache.set(cacheKey, {
          etag: response.headers.etag,
          response: response,
          body: body
        });

        whenDone(error, response, body, callback);
      } else if (response.statusCode === 304) {
        //console.log("Using cached response");
        whenDone(null, cachedResponse.response,
          cachedResponse.body, callback);
      } else {
        whenDone(error, response, body, callback);
      }

    };

    request.get(url, { headers: headers }, getCallback);
    return deferred && deferred.promise;
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

    return (body + "").replace(regex, config.siteName + "/fatt/freeagent");
  };

  var replaceLocalWithRemote = function (body) {
    var regex = new RegExp(config.siteName + "/fatt/freeagent", 'g');
    var replace = config.freeagentApi;

    //console.log('replacing', regex, replace)
    return (body + "").replace(regex, replace);
  };

  function refreshToken (user, token, callback) {
    var url = config.freeagent.apiUrl + '/token_endpoint';

    var form = { grant_type: 'refresh_token', refresh_token: token.refreshToken};
    var options = {
      url: url,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Authorization': 'Basic ' + new Buffer(config.freeagent.fattClientId+':'+config.freeagent.fattClientSecret).toString('base64'),
        'User-Agent': 'node.js'
      },
      form: form
    };

    console.log('options', options)
    request.post(options, function (error, response, body) {
      console.log("Response to refreshToken: ", error, body);
      var newToken = JSON.parse(body);
      var expiresAt = Math.round((new Date()).getTime() / 1000) + newToken.expires_in - 3600;
      storage.setUserToken(user, newToken.access_token, expiresAt, token.refreshToken, function(){
        callback(newToken.access_token);
      });
    });
  }

  return {
    apiGet: apiGet,
    apiPost: apiPost,
    apiDelete: apiDelete,
    refreshToken: refreshToken
  };
};
