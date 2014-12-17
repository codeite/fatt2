module.exports = {
  port: (process.env.PORT || 4848),

  //mongodbUrl : (process.env.MONGO_DB_URL || "mongodb://fatt-website:LlQHuBH6gAnzHdj@ds033170.mongolab.com:33170/fatt"),
  mongodbUrl : (process.env.MONGO_DB_URL || "mongodb://localhost/fatt"),

  freeagent: {
    fattClientId: (process.env.FREEAGENT_FATT_CLIENT_ID || "ZnVY2G0fN-ZzL0-XBi7L_g"),
    fattClientSecret: (process.env.FREEAGENR_FATT_CLIENT_SECRET || "4OdDfW36ONBQug4Y2_3lDw"),
    apiUrl: (process.env.FREEAGENT_API_URL || "https://api.sandbox.freeagent.com/v2"),
  },

  google: {
    clientId: (process.env.GOOGLE_CLIENT_ID || "121875671159-tggl2f47e171usdatcn4fnpeabkc6f76.apps.googleusercontent.com"),
    clientSecret: (process.env.GOOGLE_CLIENT_SECRET || "TEW03Pw8qcWFXwy0qIAFHWdy"),
    apiUrl: (process.env.GOOGLE_API_URL || "https://accounts.google.com/o/oauth2")
  },

  siteName: (process.env.SITE_NAME || "http://localhost:4848"),
  secret: (process.env.SECRECT || "this is a secret"),

};
