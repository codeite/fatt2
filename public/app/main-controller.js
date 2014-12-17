angular.module('fatt')
  .controller('MainCtrl', ['$scope', '$http', 'faApi', 'month', function($scope, $http, faApi, monthCalculator) {
    'use strict';
    var commonRecords = [];
    var database = {};

    faApi.getMe(function(foundMe) {
      $scope.me = foundMe;
    });

    faApi.getCompany(function(foundCompany) {
      $scope.company = foundCompany;
    });


    $scope.modalShown = false;
    $scope.commonRecords = commonRecords;

    var today = moment().utc().startOf('day');
    $scope.today = today.day();

    var month = today.clone().startOf('month');

    function loadPage() {
      $scope.month = month;
      $scope.monthName = month.format("MMMM YYYY");

      var result = monthCalculator.calcMonth(month, addRecordLike, database, today);
      $scope.weeks = result.weeks;
      readTimeslips(result.firstDay, result.lastDay);
    }

    loadPage();

    $scope.prevMonth = function() {
      month.add(-1, 'months');
      loadPage();
    };

    $scope.nextMonth = function() {
      month.add(1, 'months');
      loadPage();
    };



    function deleteTimeslip(timeslipUrl) {
      $http.delete(timeslipUrl).success( function(data) {
        loadPage();
      });
    }

    function addRecordLike(day, record) {
      faApi.getMe(function(me){

        console.log(me);
        console.log(day);
        console.log(record);

        var timeslip = {
          timeslip: {
            'user': me.url,
            'project': record.projectUrl,
            'task': record.taskUrl,
            'dated_on': day.name,
            'hours': record.hours
          }
        };

        console.log(timeslip);
        $http.post('/freeagent/timeslips', timeslip).success( function(data) {
          loadPage();
        });
      });
    }



    function resolveProjectName(record) {
      faApi.resolveProject(record.projectUrl, function(project) {
        record.projectName = project.name;
        record.contactUrl = project.contact;
        resolveContactName(record);
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
        if(found === null && x.hours === record.hours && x.taskUrl === record.taskUrl) {
          return x;
        }
        return found;
      }, null);

      if(match === null) {
        record.useCount++;
        commonRecords.push(record);
      } else {
        match.useCount++;

      }
    }

    function readTimeslips(firstDay, lastDay) {
      faApi.readTimeslips(firstDay.format(monthCalculator.faDateFormat), lastDay.format(monthCalculator.faDateFormat), function(data) {

        console.log("Done reading timeslips");
        var idx;

        for(idx in database) { if (database.hasOwnProperty(idx)) {
          var day = database[idx];
          day.records = [];
          day.total = 0;
        }}

        for(idx in data.timeslips) { if (data.timeslips.hasOwnProperty(idx)) {
          var timeslip = data.timeslips[idx];

          var datedOnKey = 'dated_on';
          var obj = database[timeslip[datedOnKey]];

          if(obj) {

            obj.total += +timeslip.hours;

            var record = {
              timeslipUrl: timeslip.url,
              projectUrl: timeslip.project,
              taskUrl: timeslip.task,
              projectName: "_",
              taskName: "_",
              contactName: "_",
              hours: +timeslip.hours,
              useCount: 0,
              delete: (function () {
                return function () {
                  if(confirm("Delete this?")) {
                    deleteTimeslip(this.timeslipUrl);
                  }
                };
              })()
            };

            addRecordToCommon(record);

            obj.records.push(record);

            resolveProjectName(record);
            resolveTaskName(record);
          }
        }}

        for(var idx2 in database) { if (database.hasOwnProperty(idx2)) {
            calcStatus(database[idx2]);
        }}
      });

      function calcStatus(day) {
        var hoursPerDayKey = 'hours_per_day';
          faApi.getActiveProjects(function(activeProjects) {
            var requiredHours = 0;
            for(var idx = 0; idx < activeProjects.projects.length; idx++) {
              var x = +(activeProjects.projects[idx][hoursPerDayKey]);
              if(x > requiredHours) {
                requiredHours = x;
              }
            }

            if(day.date < today && day.date.isoWeekday() < 6){

            if(day.total < requiredHours) {
              day.status = 'danger';
            } else {
              day.status = 'success';
            }
          }
        });
      }
    }
  }]);
