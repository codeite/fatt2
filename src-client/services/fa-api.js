//ls.clear()
import ls from './ls'
import moment from 'moment'
const callbacks = {}


const faApi = {
  getMe: () => getAndCache('/fatt/freeagent/users/me', "user"),
  getCompany: () => getAndCache('/fatt/freeagent/company', "company"),
  getActiveProjects: () => getAndCache('/fatt/freeagent/projects?view=active', 'projects'),
  getActiveTasks: () => getAndCache('/fatt/freeagent/tasks?view=active', 'tasks'),
  resolveProject: projectUrl => getAndCache(projectUrl, "project"),
  resolveTask: taskUrl => getAndCache(taskUrl, "task"),
  resolveContact: contactUrl => getAndCache(contactUrl, "contact"),
  readTimeslips: (fromDate, toDate) => readList(`/fatt/freeagent/timeslips?from_date=${fromDate}&to_date=${toDate}`, 'timeslips'),

  createTimeslips
}


function createTimeslips(taskUrl, hours, dates, comment) {
  console.log('taskUrl:', taskUrl)
  return Promise.all([faApi.getMe(), faApi.resolveTask(taskUrl)])
    .then(([me, task]) => {
      console.log('task:', task)
      const data = {
        timeslips: dates.map(date => {
          return {
            user: me.url,
            project: task.project,
            task: task.url,
            dated_on: date.format('YYYY-MM-DD'),
            hours: hours,
            updated_at: moment().toISOString(),
            created_at: moment().toISOString(),
            comment: comment && comment.length ? comment : undefined
          }
        })
      }

      const body = JSON.stringify(data)
      const url = '/fatt/freeagent/timeslips'

      return fetch(url, {
        credentials: 'same-origin',
        method: 'POST',
        body: body,
        headers: {
          'Content-Type': 'application/json',
        }
      })
    })


/*
{ "timeslips":
  [{
   "user":"https://api.freeagent.com/v2/users/1",
    "project":"https://api.freeagent.com/v2/projects/1",
    "task":"https://api.freeagent.com/v2/tasks/1",
    "dated_on":"2011-08-15",
    "hours":"12.0",
    "updated_at":"2011-08-16T13:32:00Z",
    "created_at":"2011-08-16T13:32:00Z"
  },
  {
    "user":"https://api.freeagent.com/v2/users/1",
    "project":"https://api.freeagent.com/v2/projects/1",
    "task":"https://api.freeagent.com/v2/tasks/1",
    "dated_on":"2011-08-14",
    "hours":"12.0",
    "updated_at":"2011-08-16T13:32:00Z",
    "created_at":"2011-08-16T13:32:00Z"
  }]
}
 */
}

function readList(url, propertyName) {
  return new Promise((resolve, reject) => {
    next(url)
    let progress
    function next(url) {
      let link
      fetch(url, {credentials: 'same-origin'})
        .then(response => {
          link = response.headers.get('link')
          return response.json()
        })
        .then(data => {
          if(progress) {
            progress[propertyName] = progress[propertyName].concat(data[propertyName]);
          } else {
            progress = data;
          }

          var links = readLinks(link)

          if(links.next) {
            next(links.next);
          } else {
            resolve(progress);
          }
        })
        .catch(err => reject(err))
    }
  })
}

function readLinks(link) {
  if(!link || link === "") {
    return {};
  }

  var bits = link.split(',');

  var res = bits.reduce(function(result, bit) {
    var leftRight = bit.split(';');
    var linkVal = leftRight[0].trim().substr(1).slice(0,-1);
    var linkName = leftRight[1].trim().substr(5).slice(0,-1);
    result[linkName] = linkVal;
    return result;
  }, {});

  return res;
}

function getAndCache(url, transform) {
  return new Promise((resolve, reject) => {
    var value = ls.getItem(url);
    //console.log('cached: ', url, value)

    if (value) {
      //console.log('object: ', url, value)
      let resolvedValue
      if (typeof(transform) === 'function') resolvedValue = transform(value)
      else if (transform) resolvedValue = value[transform]
      else resolvedValue = value
      return resolve(resolvedValue);
    }

    const resolver = {resolve, reject, transform}
    if(Array.isArray(callbacks[url])) {
      callbacks[url].push(resolver)
      return
    }

    callbacks[url] = [resolver]

    // console.log('Requesting: ', url);
    fetch(url, {credentials: 'same-origin'})
      .then(response => response.json())
      .then(data => {
        //console.log('Success: ', url, data);
        ls.setItem(url, data)

        const resolvers = callbacks[url]

        resolvers.forEach(resolver => {
          let resolvedData
          if (typeof(resolver.transform) === 'function') resolvedData = transform(data)
          else if (resolver.transform) resolvedData = data[transform]
          else resolvedData = data
          resolver.resolve(resolvedData)
        })
      })
      .catch(err => {
        console.error('Fail: ', url);
        console.error(err);

        if(err === 401) {
          window.location = '/fatt/faauth';
        }
      })
  })
}

module.exports = faApi
export default faApi