module.exports = function (path, context) {
  'use strict';
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  var authCookieName = "access_token";

  var router = require('express').Router(),
    Q = require('q'),
    _ = require('lodash'),
    moment = require('moment');

  var demand = require('../middleware/demand')(context),
    config = require('../config'),
    freeagent = require('../services/freeagent')(context),
    storage = require('../services/storage')(context);

  var getToken = function (req) {
    var defered = Q.defer();
    storage.getUserToken(req.user, function (token) {
      defered.resolve(token || req.cookies[authCookieName]);
    });
    return defered.promise;
  };

  var buildUrl = function (apiRoot, path, query) {
    var url = apiRoot + path;

    if (typeof (query) === 'object') {
      url += '?';

      var bits = [];
      for (var i in query) {
        if (query.hasOwnProperty(i)) {
          bits.push(i + "=" + query[i]);
        }
      }
      url += bits.join("&");
    }

    return url;
  };

  router.get('/:to.:ext?', demand("fa"), function (req, res) {
    var to = req.params.to;
    to = moment(to);
    var from = to.clone().add(-1, 'month').add(1, 'day');

    from = from.format('YYYY-MM-DD');
    to = to.format('YYYY-MM-DD');


    var url = buildUrl(config.freeagent.apiUrl, '/timeslips?from_date=' + from + '&to_date=' + to);
    console.log("GET: " + url);


    getToken(req)
      .then(function (authToken) {
        return freeagent.apiGet(authToken, url);
      })
      .then(function (data) {

        var rawTimeslips = JSON.parse(data.response.body).timeslips;

        return resolveTimeslips(data.authToken, rawTimeslips)
      })
      .then(function (resolvedTimeslips) {
        console.log('Done. Sending result');

        if(req.params.ext == 'int'){
          console.log('sending: ', resolvedTimeslips);
          console.log('sending: ', resolvedTimeslips.total);
          res.json(resolvedTimeslips.total);
        } else {
          res.json({
            from: from,
            data: resolvedTimeslips,
            to: to
          });
        }
      });

  });

  function resolveTimeslips(authToken, rawTimeslips) {
    var defered = Q.defer();
    var resolvedTimeslips = [];
    var references = {};
    var total = 0;

    _.each(rawTimeslips, function (ts) {
      resolvedTimeslips.push({
        raw: ts,
        dated_on: ts.dated_on,
        hours: parseFloat(ts.hours)
      });

      if (references[ts.task] === undefined) {
        references[ts.task] = Q.Promise(function(resolve){
          var task = ts.task;
          freeagent.apiGet(authToken, ts.task)
            .then(function(data){
              resolve([task, JSON.parse(data.body)]);
            });
        });
      }

      if (references[ts.project] === undefined) {
        references[ts.project] = Q.Promise(function(resolve){
          var project = ts.project;
          freeagent.apiGet(authToken, ts.project)
            .then(function(data){
              resolve([project, JSON.parse(data.body)]);
            });
        });
      }
    });

    console.log('references', references);
    Q.all(_.values(references)).then(function(vals){
      var db = _.zipObject(vals);
      console.log('db', db);

      _.each(resolvedTimeslips, function (ts) {
        ts.task = db[ts.raw.task].task;
        ts.project = db[ts.raw.project].project;
        var val = calcValue(ts);
        total += val;
        ts.value = val;
      });

      defered.resolve({
        total: total,
        resolvedTimeslips: resolvedTimeslips
      });
    });



    return defered.promise;
  }

  function calcValue(ts){
    if(!ts.task.is_billable){
      return 0;
    }

    if(ts.task.billing_period == 'hour'){
      return parseFloat(ts.task.billing_rate) * parseFloat(ts.hours);
    }

    if(ts.task.billing_period == 'day'){
      var perDay = parseFloat(ts.project.hours_per_day);
      return parseFloat(ts.task.billing_rate) * (parseFloat(ts.hours)/perDay);
    }

    return -1;
  }

  return router;
}
;