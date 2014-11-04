
angular.module('fatt',[])
  .controller('MainCtrl', function($scope, $http) {
    var projects = {}
    var tasks = {}
    var contacts = {}

    var today = moment().utc();
    var faDateFormat = "YYYY-MM-DD";
    $scope.today = today.day();

    var month = today.clone().startOf('month')

    $scope.month = month
    $scope.monthName = month.format("MMMM")

    var offset = (month.day()+6) % 7
    var firstDay = month.clone().subtract(offset, 'days')
    var currentDate = firstDay.clone();
    var lastDay = firstDay.clone().add(6, 'weeks')


    var weeks = []
    var database = {}

    for(var weekIndex=0; weekIndex<6; weekIndex++) {
      var week = []
      for (var i=0; i<7; i++) {
        var name = currentDate.format(faDateFormat);
        var dayObject = {day: currentDate.date(), total: 0, records: [], name: name}
        week.push(dayObject)
        database[name] = dayObject
        dayObject.add = function() {
          var currentDayObject = dayObject;
          return function() {
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

      for(index in data.timeslips) {
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
