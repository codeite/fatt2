angular.module("fatt")
  .factory("faApi", ["$http", function($http) {
    var database = {};

    var getMe = function(callback) {
      getAndCache('/freeagent/users/me', "user", callback);
    };

    var getActiveProjects = function(callback) {
      getAndCache('/freeagent/projects?view=active', null, callback);
    };

    function resolveProject(projectUrl, callback) {
      getAndCache(projectUrl, "project", callback);
    };

    function resolveTask(taskUrl, callback) {
      getAndCache(taskUrl, "task", callback);
    }

    function resolveContact(contactUrl, callback) {
      getAndCache(contactUrl, "contact", callback);
    }

    function readTimeslips(from_date, to_date, callback) {
    	var url = '/freeagent/timeslips?from_date='+from_date+'&to_date='+to_date;
      readList(url, callback, 'timeslips');
    }

    function readList(url, callback, propertyName, progress) {
      $http.get(url).success(function(data, status, headers) {
        if(progress) {
          progress[propertyName] = progress[propertyName].concat(data[propertyName]);
        } else {
          progress = data;
        }

        var links = readLinks(headers())

        if(links.next) {
          readList(links.next, callback, propertyName, progress);
        } else {
          callback(progress);
        }


      });
    }

    var readLinks = function(headers) {
      if(!headers.link || headers.link == ""){
        return {}
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
    }

    var getAndCache = function(url, transform, callback) {
      if(typeof(callback) != "function") {
        callback = function(){};
      }

      var value = database[url];

      if(Array.isArray(value)) {
        value.push(callback);
      } else if (typeof(value) == 'object') {
        callback(value);
      } else {
        database[url] = []
        database[url].push(callback);

        $http.get(url).success(function(data){
          var callbacks = database[url];

          var result;
          if(transform == null) {
            result = data;
          } else  if(typeof(transform) == 'function'){
            result = transform(data);
          } else {
            result = data[transform]
          }

          database[url] = result;

          for(var idx=0; idx<callbacks.length; idx++){
            var callback = callbacks[idx];
            callback(result);
          }
        });
      }
    };

    return {
      getMe : getMe,
      getActiveProjects : getActiveProjects,
      resolveProject: resolveProject,
      resolveTask: resolveTask,
      resolveContact: resolveContact,
      readTimeslips: readTimeslips

    };
  }])
