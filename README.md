FATT
----

Free Agent Time Tracker

## About

A web based tool for logging your hours in FreeAgent.

Its focussed around the month view and logging a whole months worth of
times.

After reading the note below and if you are feeling (very) brave you can try it at: http://fatt.codeite.com  

## *Important*
DO NOT USE THIS SOFTWARE  
It's not properly tested. I use it, but I'm a reckless fool and I've only got my self to blame.

## Screenshot
![alt text](https://raw.githubusercontent.com/codeite/images/master/fatt.png)

Green shows a day with all hours complete   
Red shows days with missing hours   
White show days that have not happened yet   
Yellow shows weekends   

## Setting up your own

The following env vars need to be set to run:

* PORT: The port the service will listen on
* FREEAGENR_FATT_CLIENT_SECRET: Labeled "OAuth secret" in Freeagent developer dashboard
* FREEAGENT_API_URL: For live use https://api.freeagent.com/v2 or for the sandbox use https://api.sandbox.freeagent.com/v2
* FREEAGENT_FATT_CLIENT_ID: Labeled "OAuth identifier" in Freeagent developer dashboard
* GOOGLE_API_URL: https://accounts.google.com/o/oauth2
* GOOGLE_CLIENT_ID: Your google APIs client ID
* GOOGLE_CLIENT_SECRET: Your google APIs client secret
* MONGO_DB_URL: The connection string of your mongo instance. Should look like: mongodb://fatt-website:LlQHuBH6gAnzHdj@ds033170.mongolab.com:33170/fatt
* SECRET: Used to sign authentication tokes, can be what ever you like
* SITE_NAME: The url your site is hosts at to redirect back to from google. E.g. "http://fatt.codeite.com"

# Requirements

Node version 0.10 or above.

## To run

$ `npm instal`

$ `npm start`

## Running the tests

Yeah, so, tests. Um. Move alone, nothing to see here.

Do *not* run this against the FreeAgent account you use to like, earn money to buy food and stuff. It will probably do terrible things to it and by extension, you.
