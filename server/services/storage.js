module.exports = function (config) {
  'use strict';
  var MongoClient = require('mongodb').MongoClient;

  var throwError = function(err) {
    if(err) {
      throw err;
    }
  };

  var connect = function(callback) {
    MongoClient.connect(config.mongodbUrl, function(err, db) {
      throwError(err);

      db.collection('users', function(err, users){
        throwError(err);

        callback(db, users);
      });
    });
  };


  var saveUser = function (email, authCode, idCode, callback) {
    connect(function (db, users) {

      users.update(
        {_id: email},

        {$set:{
          email: email,
          authCode: authCode,
          idCode: idCode
        }},

        // options
        {
          "multi" : false,  // update only one document
          "upsert" : true  // insert a new document, if no existing document match the query
        },

        function(err, res) {
          throwError(err);
          callback("Added");
        }
      );
    });
  };

  var setUserToken = function (email, token, callback) {
    connect(function (db, users) {

      users.update(
        {_id: email},

        {$set:{
          freeagentToken: token
        }},

        // options
        {
          "multi" : false,  // update only one document
          "upsert" : true  // insert a new document, if no existing document match the query
        },

        function(err, res){
          throwError(err);
          callback();
        }
      );

    });
  };

  var getUserToken = function (email, callback) {
    if(!email) {
      callback(null);
    }

    connect(function (db, users) {
      users.findOne({_id: email}, function(err, item) {
        throwError(err);
        callback(item && item.freeagentToken);
      });
    });
  };

  return {
    saveUser: saveUser,
    setUserToken: setUserToken,
    getUserToken: getUserToken
  };
};
