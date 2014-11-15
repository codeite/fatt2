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
      resolveContact: resolveContact

    };
  }])