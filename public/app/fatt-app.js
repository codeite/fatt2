angular.module('fatt')
  .controller('MainCtrl', ['$scope', '$http', 'faApi', function($scope, $http, faApi) {
    var commonRecords = [];

    faApi.getMe(function(foundMe) {$scope.me = foundMe} );

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
      faApi.getMe(function(me){

        console.log(me);
        console.log(day);
        console.log(record);

        var timeslip = {
          timeslip: {
            user: me.url,
            project: record.projectUrl,
            task: record.taskUrl,
            dated_on: day.name,
            hours: record.hours
          }
        };

        console.log(timeslip);
        $http.post('/freeagent/timeslips', timeslip).success( function(data) {
          readTimeslips();
        });
      });
    }

    $scope.weeks = weeks
    readTimeslips();

    function resolveProjectName(record) {
      faApi.resolveProject(record.projectUrl, function(project) {
        record.projectName = project.name;
        record.contactUrl = project.contact;
        resolveContactName(record)
      });
    }

    function resolveTaskName(record) {
      faApi.resolveTask(record.taskUrl, function(task) {
        record.taskName = task.name;
      });
    }

    function resolveContactName(record) {
      faApi.resolveContact(record.contactUrl, function(contact) {
        record.contactName = contact.name;
      });
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
          faApi.getActiveProjects(function(activeProjects) {
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
        });      
      }
    }
  }]);
