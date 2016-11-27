module.exports = function (context) {
  var users = {};

  var saveUser = function (email, authCode, idCode, callback) {
    users[email] = {
      email: email,
      authCode: authCode,
      idCode: idCode
    }
    process.nextTick(()=>callback());
  };

  var setUserToken = function (email, token, callback) {
    var user = users[email];
    user.freeagentToken = token;
    process.nextTick(()=>callback());
  };

  var getUserToken = function (email, callback) {
    if(!email) {
      callback(null);
    }

    var user = users[email];
    process.nextTick(()=>callback(user && user.freeagentToken));
  };

  return {
    saveUser: saveUser,
    setUserToken: setUserToken,
    getUserToken: getUserToken
  };
};
