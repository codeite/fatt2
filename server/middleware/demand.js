module.exports = function (context) {
  'use strict';

  var storage = require('../services/storage')(context);

  var makeResourcesArray = function(resources) {
    if(Array.isArray(resources)){
      return resources;
    } else {
      return resources.toString().split(';');
    }
  };

  var fa = function(req, res, next) {
    // Should confirm we are logged in first
    ae(req, res, function() {

      storage.getUserToken(req.user, function(token) {

        if(!token) {
          console.log("Error getting token for 'fa': Token is false ish: ", token);
          res.redirect(context.root + 'faauth');
          return;
        }

        next();
      });
    });
  };

  var ae = function(req, res, next) {
    if(!req.user) {
      var loginPath = context.root + 'sign'
      console.log('Need to be authenticated, forwarding to', loginPath);
      res.redirect(loginPath);
    } else {
      next();
    }
  };

  var authorisationTypes = {
    fa: fa,
    ae: ae
  };

  return function(resources) {

    return function(req, res, next) {

       var resourceArray = makeResourcesArray(resources);
       // console.log("Assessing demands array: ", resourceArray);

       function processor() {
        var resource = resourceArray.pop();
        // console.log("Assessing demand ", resource);

        if(typeof(resource) === 'undefined') {
          console.log('All demands met');
          next();
        } else {
          var predicate = authorisationTypes[resource];

          if(!predicate) {
            throw "Undefined resource demand: "+resource;
          }

          predicate(req, res, processor);
        }
      }

      processor();

    };
  };
};
