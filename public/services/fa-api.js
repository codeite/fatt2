angular.module("fatt")
  .factory("faApi", ["$http", function($http) {
    'use strict';
    var database = {};

    var getMe = function(callback) {
      getAndCache('/freeagent/users/me', "user", callback);
    };

    var getCompany = function(callback) {
      getAndCache('/freeagent/company', "company", callback);
    };

    var getActiveProjects = function(callback) {
      getAndCache('/freeagent/projects?view=active', null, callback);
    };

    var resolveProject = function (projectUrl, callback) {
      getAndCache(projectUrl, "project", callback);
    };

    var resolveTask = function (taskUrl, callback) {
      getAndCache(taskUrl, "task", callback);
    };

    var resolveContact = function (contactUrl, callback) {
      getAndCache(contactUrl, "contact", callback);
    };

    var readTimeslips = function (fromDate, toDate, callback) {
    	var url = '/freeagent/timeslips?from_date='+fromDate+'&to_date='+toDate;
      readList(url, callback, 'timeslips');
    };

    function readList(url, callback, propertyName, progress) {
      $http.get(url).success(function(data, status, headers) {
        if(progress) {
          progress[propertyName] = progress[propertyName].concat(data[propertyName]);
        } else {
          progress = data;
        }

        var links = readLinks(headers());

        if(links.next) {
          readList(links.next, callback, propertyName, progress);
        } else {
          callback(progress);
        }


      });
    }

    var readLinks = function(headers) {
      if(!headers.link || headers.link === "") {
        return {};
      }

      var bits = headers.link.split(',');

      var res = bits.reduce(function(result, bit) {
        var leftRight = bit.split(';');
        var linkVal = leftRight[0].trim().substr(1).slice(0,-1);
        var linkName = leftRight[1].trim().substr(5).slice(0,-1);
        result[linkName] = linkVal;
        return result;
      }, {});

      return res;
    };

    var getAndCache = function(url, transform, callback) {
      if(typeof(callback) !== "function") {
        callback = function(){};
      }

      var value = database[url];

      if(Array.isArray(value)) {
        value.push(callback);
      } else if (typeof(value) === 'object') {
        callback(value);
      } else {
        database[url] = [];
        database[url].push(callback);

        //console.log('Requesting: ', url);
        $http.get(url)
          .success(function (data) {
            console.log('Success: ', url);
            var callbacks = database[url];

            var result;
            if(transform === null) {
              result = data;
            } else  if(typeof(transform) === 'function'){
              result = transform(data);
            } else {
              result = data[transform];
            }

            database[url] = result;

            for(var idx=0; idx<callbacks.length; idx++){
              var callback = callbacks[idx];
              callback(result);
            }
          }).error(function (data, status, error, config) {
            console.error('Fail: ', url);
            console.error(status);

            if(status === 401) {
              window.location = '/faauth';
            }
          }).then(function (){console.log('then');});
      }
    };

    return {
      getMe : getMe,
      getCompany: getCompany,
      getActiveProjects : getActiveProjects,
      resolveProject: resolveProject,
      resolveTask: resolveTask,
      resolveContact: resolveContact,
      readTimeslips: readTimeslips

    };
  }]);
