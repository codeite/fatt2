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
          callback(error, response, replaceReferences(data))
        });
      } else {
        callback(error, response, replaceReferences(body))
      };
    }
    );
};

var replaceReferences = function(body) {
  return body.replace(/https:\/\/api.sandbox.freeagent.com\/v2\//g, "http://localhost:4848/freeagent/")

}

var getProjects = function(authToken, callback) {
  apiGet(authToken, "https://api.sandbox.freeagent.com/v2/projects/", callback)
}

module.exports = {
  apiGet: apiGet,
  getProjects: getProjects
};
