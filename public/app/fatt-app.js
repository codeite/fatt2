var app = angular.module('fatt',[])

app.directive('modalDialog', function() {
  return {
    restrict: 'E',
    scope: {
      show: '='
    },
    replace: true, // Replace with the template below
    transclude: true, // we want to insert custom content inside the directive
    link: function(scope, element, attrs) {
      scope.dialogStyle = {};
      if (attrs.width)
        scope.dialogStyle.width = attrs.width;
      if (attrs.height)
        scope.dialogStyle.height = attrs.height;
      scope.hideModal = function() {
        scope.show = false;
      };
    },
    template: "<div class='ng-modal' ng-show='show'><div class='ng-modal-overlay' ng-click='hideModal()'></div><div class='ng-modal-dialog' ng-style='dialogStyle'><div class='ng-modal-close' ng-click='hideModal()'>X</div><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
  };
});


app.controller('MainCtrl', function($scope, $http) {
  var projects = {};
  var tasks = {};
  var contacts = {};
  var activeProjects = undefined;

  $scope.modalShown = false;

  var today = moment().utc().startOf('day');
  var faDateFormat = "YYYY-MM-DD";
  $scope.today = today.day();

  var month = today.clone().startOf('month')

  $scope.month = month
  $scope.monthName = month.format("MMMM")

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
        status = 'active'
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
        return function() {
           $scope.modalShown = !$scope.modalShown;
           /*
           currentDayObject.records.push({
             projectName: "Proj",
             taskName: "Task",
             contactName: "Contact",
             hours: 3
           });

           currentDayObject.total = currentDayObject.records.reduce(
             function(acc, cur){
               return +acc + +cur.hours;
             }, 0
           )
           */
        }
      }();

      currentDate.add(1, 'days')
    }
    weeks.push(week)
  }
  console.log(weeks)
  $scope.weeks = weeks

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


  //$http.get('/api/freeagent/v2/timeslips?from_date=2012-01-01&to_date=2012-03-31')
  $http.get('/freeagent/timeslips?from_date='+firstDay.format(faDateFormat)+'&to_date='+lastDay.format(faDateFormat)).success(function(data){
    var timeSlips = data;
    var index;

    for(var index in data.timeslips) {
      var timeslip = data.timeslips[index]

      var obj = database[timeslip.dated_on];

      if(obj) {
        console.log("Found: ", obj.name)
        obj.total += +timeslip.hours

        var record = {
          projectUrl: timeslip.project,
          taskUrl: timeslip.task,
          projectName: "_",
          taskName: "_",
          contactName: "_",
          hours: +timeslip.hours
        }

        obj.records.push(record)

        resolveProjectName(record)
        resolveTaskName(record)
      }
    }

    for(var idx in database) {
      var day = database[idx];
      calcStatus(day)
    }

    function calcStatus(day) {

      if(Array.isArray(activeProjects)) {
        activeProjects.push(day)
      } else if(typeof(activeProjects) == 'object') {
        if(activeProjects.projects.length == 1) {
          var requiredHours = +(activeProjects.projects[0].hours_per_day);

          console.log(day.date, today, day.date < today)

          if(day.date < today && day.date.isoWeekday() < 6){

            if(day.total < requiredHours) {
              day.status = 'danger'
            } else {
              day.status = 'success'
            }
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

    function resolveProjects(continuation) {

      $http.get('/freeagent/projects').success(function(data) {
        var projects = data;
        console.log('projects:', data);
        // var index;
        //
        // for(index in data.timeslips) {
        //   var timeslip = data.timeslips[index]
        //
        //   var obj = database[timeslip.dated_on];
        //
        //   if(obj){
        //     obj.total += timeslip.hours
        //     obj.records.push({
        //       projectUrl: timeslips.project,
        //       taskUrl: timeslips.task,
        //       lable: timeslip.project,
        //       hours: timeslip.hours
        //     })
        //   }
      });
    }

    function resolveTasks() {

    }

    //resolveProjects(function(){resolveTasks();});
  })
});
