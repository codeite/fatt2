module.exports = function (config) {
  'use strict';
  var MongoClient = require('mongodb').MongoClient;

  var saveUser = function (email, authCode, idCode, callback) {
    MongoClient.connect(config.mongodbUrl, function(err, db) {
    if(err) { throw err; }

    var collection = db.collection('users');

    var user = {
      _id: email,
      email: email,
      authCode: authCode,
      idCode: idCode
    };

    collection.insert(user, function(err, count){
      callback(null, "Added");
    });
  });
  };

  return {
    saveUser: saveUser

  };
};
