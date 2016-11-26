'use strict';
const conf = require('sp-conf');

const config = {
  port: conf.readNumber('PORT', {defaultValue: 4848}),

  //mongodbUrl : (process.env.MONGO_DB_URL || "mongodb://fatt-website:LlQHuBH6gAnzHdj@ds033170.mongolab.com:33170/fatt"),
  mongodbUrl : conf.readString('MONGO_DB_URL', {defaultValue: 'mongodb://localhost/fatt'}),

  freeagent: {
    fattClientId: conf.readString('FREEAGENT_FATT_CLIENT_ID', 'TzcqWgPMA0Vsonbt1JU3jQ'),
    //fattClientId: conf.readString('FREEAGENT_FATT_CLIENT_ID', 'ZnVY2G0fN-ZzL0-XBi7L_g'),
    fattClientSecret: conf.readPassword('FREEAGENR_FATT_CLIENT_SECRET', 'HUkvRvmJVnmX9k7uN2JrXA'),
    //fattClientSecret: conf.readPassword('FREEAGENR_FATT_CLIENT_SECRET', '4OdDfW36ONBQug4Y2_3lDw'),
    apiUrl: conf.readString('FREEAGENT_API_URL', 'https://api.sandbox.freeagent.com/v2'),
  },

  google: {
    clientId: conf.readString('GOOGLE_CLIENT_ID', '121875671159-tggl2f47e171usdatcn4fnpeabkc6f76.apps.googleusercontent.com'),
    clientSecret: conf.readPassword('GOOGLE_CLIENT_SECRET', 'TEW03Pw8qcWFXwy0qIAFHWdy'),
    apiUrl: conf.readString('GOOGLE_API_URL', 'https://accounts.google.com/o/oauth2')
  },

  siteName: conf.readString('SITE_NAME', 'http://localhost:4848'),
  secret: conf.readPassword('SECRECT', 'this is a secret')
};

if(conf.missingEnvVars) {
  log.error('Some env vars are missing. Terminating.');
  process.exit(1);
}

module.exports = config;
