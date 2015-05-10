module.exports = function (path, context) {
  'use strict';
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  var authCookieName = "access_token";

  var router = require('express').Router(),
    Q = require('q'),
    _ = require('lodash'),
    moment = require('moment'),
    parseLinks = require('parse-link-header');

  var demand = require('../middleware/demand')(context),
    config = require('../config'),
    freeagent = require('../services/freeagent')(context),
    storage = require('../services/storage')(context);

  router.get('/:tyear-:tmonth-:tday.:ext?', demand("fa"), function (req, res) {
    var to = req.params.tyear+'-'+req.params.tmonth+'-'+req.params.tday;
    to = moment(to);
    var from = to.clone().add(-1, 'month').add(1, 'day');

    var availsDays = workingDays(from, to);

    from = from.format('YYYY-MM-DD');
    to = to.format('YYYY-MM-DD');

    var state = {
      availsDays: availsDays,
      req: req,
      res: res,
      from: from,
      to: to
    };

    calc(state);
  });

  router.get('/:year.:ext?', demand("fa"), function (req, res) {
    var from = moment(req.params.year + '-04-06');
    var to = from.clone().add(1, 'year').add(-1, 'day');

    if(to > moment()){
      to = moment().startOf('day');
    }

    var availsDays = workingDays(from, to);

    from = from.format('YYYY-MM-DD');
    to = to.format('YYYY-MM-DD');


    var state = {
      availsDays: availsDays,
      req: req,
      res: res,
      from: from,
      to: to
    };

    calc(state);

  });

  function workingDays(start, end) {
    var first = start.clone().endOf('week'); // end of first week
    var last = end.clone().startOf('week'); // start of last week
    var days = last.diff(first,'days') * 5 / 7; // this will always multiply of 7
    var wfirst = first.day() - start.day(); // check first week
    if(start.day() == 0) --wfirst; // -1 if start with sunday
    var wlast = end.day() - last.day(); // check last week
    if(end.day() == 6) --wlast; // -1 if end with saturday
    return wfirst + days + wlast; // get the total
  }

  function calc (state) {
    var url = buildUrl(config.freeagent.apiUrl, '/timeslips?from_date=' + state.from + '&to_date=' + state.to);
    state.url = url;

    Q.fcall(getToken, state)
      .then(getTimeslips)
      .then(readReferences)
      .then(addUpMonth)
      .then(function (state) {
        console.log('Done. Sending result');

        if ( state.req.params.ext == 'total') {
          state.res.json(state.total);
        } else if ( state.req.params.ext == 'workedDays') {
          state.res.json(state.workedDays);
        } else {
          state.res.json({
            from: state.from,
            to: state.to,
            workedDays: state.workedDays,
            availsDays: state.availsDays,
            total: state.total,
            data: state.month
          });
        }
      })
      .catch(function(err){

        console.error('Its all gone wrong');
        console.trace( err);
        state.res.send(err);
      });
  }

  function getToken (state) {
    var req = state.req;
    var defered = Q.defer();
    storage.getUserToken(req.user, function (token) {
      state.authToken = token || req.cookies[authCookieName];

      console.log('done getToken');
      defered.resolve(state);
    });
    return defered.promise;
  }

  function getTimeslips(state) {
    if(state.rawTimeslips === undefined) {
      state.rawTimeslips = [];
      state.defer = Q.defer();
    } else {
      console.log('state.authToken, state.url', state.authToken, state.url)
    }

    var options = {
      url: state.url,
      replaceWithLocal: false
    };


    freeagent.apiGet(state.authToken, options).then(function (data) {

      var timeslips = JSON.parse(data.response.body).timeslips;
      Array.prototype.push.apply(state.rawTimeslips, timeslips);

      var linksHeader = data.response.headers.link.replace(/'/g, '"');
      console.log('Got some', linksHeader);

      if(linksHeader) {

        var links = parseLinks(linksHeader);
        console.log('links', links);

        if (links.next && links.next.url) {
          console.log('Still some more to get...');
          state.url = links.next.url;
          getTimeslips(state);
          return;
        } else {
          console.log('No more to get',  links);
        }
      }

      console.log('done getTimeslips');
      var defer = state.defer;
      state.defer = null;
      defer.resolve(state);
    });
    return state.defer.promise;
  }

  function addUpMonth(state) {
    state.total = 0;
    state.workedDays = 0;
    var month = {};
    var db = state.db;

    _.each(state.rawTimeslips, function (ts) {

      var day = month[ts.dated_on];
      if (day === undefined) {
        month[ts.dated_on] = day = {
          timeslips: [],
          total: 0,
          worked: 0,
        };
      }
      var nts = {};

      var task = db[ts.task].task;
      //nts.task = task;

      var project = db[ts.project].project;
      //nts.project = project;

      nts.hours = parseFloat(ts.hours);
      nts.hoursPerDay = parseFloat(project.hours_per_day);
      nts.rate = calcRate(nts.hoursPerDay, task);

      if(nts.rate > 0) {
        var effort = nts.hours / nts.hoursPerDay;
        day.worked += effort
        state.workedDays += effort;
      }

      var earned = nts.hours * nts.rate;
      nts.earned = earned;

      state.total += earned;
      day.total += earned;
      nts.value = earned;

      day.timeslips.push(nts);
    });

    state.month = month;

    console.log('done addUpMonth');
    return Q.fcall(function () { return state; });
  }

  function calcRate(hoursPerDay, task) {
    if (!task.is_billable) {
      return 0;
    }

    var rawRate = parseFloat(task.billing_rate);

    if (task.billing_period == 'hour') {
      return rawRate;
    }

    if (task.billing_period == 'day') {
      return rawRate / hoursPerDay;
    }
  }

  function readReferences(state) {
    var references = {};
    var count = 0;

    _.each(state.rawTimeslips, function (ts) {

      if (ts.task && references[ts.task] === undefined) {
        count++;
        console.log('ts.task', ts.task);
        references[ts.task] = Q.Promise(function (resolve) {
          var task = ts.task;
          freeagent.apiGet(state.authToken, ts.task)
            .then(function (data) {
              resolve([task, JSON.parse(data.body)]);
            });
        });
      }

      if (ts.project && references[ts.project] === undefined) {
        count++;
        console.log('ts.project', ts.project);
        references[ts.project] = Q.Promise(function (resolve) {
          var project = ts.project;
          freeagent.apiGet(state.authToken, ts.project)
            .then(function (data) {
              resolve([project, JSON.parse(data.body)]);
            });
        });
      }
    });

    console.log('count', count);

    if(count == 0){
      console.log('no need to readReferences');
      state.db = {};
      return Q.fcall(function () { return state; });
    }

    return Q.all(_.values(references))
      .then(function (vals) {
        state.db = _.zipObject(vals);

        console.log('done readReferences');
        return Q.fcall(function () { return state; });
      });
  }


  function buildUrl (apiRoot, path, query) {
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

  return router;
}
