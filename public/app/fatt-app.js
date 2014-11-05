var app = angular.module('fatt',['ui.bootstrap'])

app.controller('MainCtrl', function($scope, $http) {
  var projects = {};
  var tasks = {};
  var contacts = {};
  var activeProjects = undefined;
  var commonRecords = [];
  var me = undefined;

  getMe(function(foundMe){$scope.me = foundMe});

  $scope.modalShown = false;
  $scope.commonRecords = commonRecords;

  var today = moment().utc().startOf('day');
  var faDateFormat = "YYYY-MM-DD";
  $scope.today = today.day();

  var month = today.clone().startOf('month')

  $scope.month = month
  $scope.monthName = month.format("MMMM YYYY")

  var offset = month.isoWeekday() - 1
  var firstDay = month.clone().subtract(offset, 'days')
  var currentDate = firstDay.clone();
  var lastDay = firstDay.clone().add(6, 'weeks')

  var weeks = []
  var database = {}

  for(var weekIndex=0; weekIndex<6; weekIndex++) {
    var week = []
    for (var i=0; i<7; i++) {
      var name = currentDate.format(faDateFormat);

      var thisMonth = currentDate.month() == month.month();

      var status = '';

      if(currentDate.isoWeekday() >= 6) {
        status = 'warning'
      }

      if(currentDate.format(faDateFormat) == today.format(faDateFormat)) {
        status = 'active text-primary'
      }

      var dayObject = {
        date: currentDate.clone(),
        day: currentDate.format("Do"),
        total: 0,
        records: [],
        name: name,
        status: status,
        thisMonth: thisMonth?'':'text-muted'
      };
      week.push(dayObject)
      database[name] = dayObject
      dayObject.add = function() {
        var currentDayObject = dayObject;
        return function(record) {

          addRecordLike(currentDayObject, record);


        }
      }();

      currentDate.add(1, 'days')
    }
    weeks.push(week)
  }

  function deleteTimeslip(timeslipUrl) {
    $http.delete(timeslipUrl).success( function(data) {
      readTimeslips();
    });
  }

  function addRecordLike(day, record) {
    getMe(function(me){

      console.log(me);
      console.log(day);
      console.log(record);

      var timeslip = {
        timeslip: {
          user: me.url,
          project: record.projectUrl,
          task: record.taskUrl,
          dated_on: day.name,
          hours: record.hours,
          comment: 'Created using fatt'
        }
      };

      console.log(timeslip);
      $http.post('/freeagent/timeslips', timeslip).success( function(data) {
        readTimeslips();
      });
    });
  }

  // '/freeagent/users/me'
  function getMe(callback){

    if(Array.isArray(me)) {
      me.push(callback)
    } else if(typeof(me) == 'object') {
      if(typeof(callback) == 'function') {
        callback(me);
      }
    } else {
      me = [];
      me.push(callback)

      $http.get('/freeagent/users/me').success(function(data) {
        var callbacks = me;
        me = data.user

        for(var idx=0; idx<callbacks.length; idx++) {
          getMe(callbacks[idx]);
        }
      });
    }
  }


  $scope.weeks = weeks
  readTimeslips();

  function resolveProjectName(record) {
    var project = projects[record.projectUrl];

    if(Array.isArray(project)) {
      project.push(record)
    } else if(typeof(project) == 'object') {
      record.projectName = project.name;
      record.contactUrl = project.contact;
      resolveContactName(record)
    } else {
      projects[record.projectUrl] = [];
      projects[record.projectUrl].push(record)

      $http.get(record.projectUrl).success(function(data) {
        var records = projects[record.projectUrl];
        projects[record.projectUrl] = data.project

        for(var idx=0; idx<records.length; idx++){
          resolveProjectName(records[idx]);
        }
      });

    }
  }

  function resolveTaskName(record) {
    var task = tasks[record.taskUrl];

    if(Array.isArray(task)) {
      task.push(record)
    } else if(typeof(task) == 'object') {
      record.taskName = task.name
    } else {
      tasks[record.taskUrl] = [];
      tasks[record.taskUrl].push(record)


      $http.get(record.taskUrl).success(function(data) {
        var records = tasks[record.taskUrl];
        tasks[record.taskUrl] = data.task

        for(var idx=0; idx<records.length; idx++){
         resolveTaskName(records[idx]);
        }
      });

    }
  }

  function resolveContactName(record) {
    var contact = contacts[record.contactUrl];

    if(Array.isArray(contact)) {
      contact.push(record)
    } else if(typeof(contact) == 'object') {
      record.contactName = contact.organisation_name
    } else {
      contacts[record.contactUrl] = [];
      contacts[record.contactUrl].push(record)

      $http.get(record.contactUrl).success(function(data) {
        var records = contacts[record.contactUrl];
        contacts[record.contactUrl] = data.contact

        for(var idx=0; idx<records.length; idx++){
         resolveContactName(records[idx]);
        }
      });

    }
  }

  function addRecordToCommon(record) {
    var match = commonRecords.reduce(function(found, x) {
      if(found === null && x.hours == record.hours && x.taskUrl == record.taskUrl) {
        return x
      }
      return found;
    }, null);

    if(match === null) {
      record.useCount++;
      commonRecords.push(record)
    } else {
      match.useCount++;

    }
  }

  function readTimeslips() {
    $http.get('/freeagent/timeslips?from_date='+firstDay.format(faDateFormat)+'&to_date='+lastDay.format(faDateFormat)).success(function(data){
      console.log("Done reading timeslips");

      for(var idx in database) {
        var day = database[idx];
        day.records = [];
        day.total = 0;
      }

      var timeSlips = data;
      var index;

      for(var index in data.timeslips) {
        var timeslip = data.timeslips[index]

        var obj = database[timeslip.dated_on];

        if(obj) {

          obj.total += +timeslip.hours

          var record = {
            timeslipUrl: timeslip.url,
            projectUrl: timeslip.project,
            taskUrl: timeslip.task,
            projectName: "_",
            taskName: "_",
            contactName: "_",
            hours: +timeslip.hours,
            useCount: 0,
            delete: function(){
              if(confirm("Delete this?"))
                deleteTimeslip(this.timeslipUrl);
            }
          }

          addRecordToCommon(record);

          obj.records.push(record)

          resolveProjectName(record)
          resolveTaskName(record)
        }
      }

      for(var idx in database) {
        var day = database[idx];
        calcStatus(day)
      }
    });

    function calcStatus(day) {

      if(Array.isArray(activeProjects)) {
        activeProjects.push(day)
      } else if(typeof(activeProjects) == 'object') {

        var requiredHours = 0;
        for(var idx = 0; idx < activeProjects.projects.length; idx++) {
          var x = +(activeProjects.projects[idx].hours_per_day);
          if(x > requiredHours)
            requiredHours = x;
        }

        if(day.date < today && day.date.isoWeekday() < 6){

          if(day.total < requiredHours) {
            day.status = 'danger'
          } else {
            day.status = 'success'
          }

        }
      } else {
        activeProjects = [];
        activeProjects.push(day)

        $http.get('/freeagent/projects?view=active').success(function(data) {
          var days = activeProjects;
          activeProjects = data

          for(var idx=0; idx<days.length; idx++) {
            calcStatus(days[idx]);
          }
        });

      }
    }

  }
});
