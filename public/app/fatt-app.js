angular.module('fatt',[])
  .controller('MainCtrl', function($scope, $http) {
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
        var obj = {day: currentDate.date(), hours: 0}
        week.push(obj)
        database[currentDate.format(faDateFormat)] = obj
        currentDate.add(1, 'days')
      }
      weeks.push(week)
    }
    console.log(weeks)
    $scope.weeks = weeks

    //$http.get('/api/freeagent/v2/timeslips?from_date=2012-01-01&to_date=2012-03-31')
    $http.get('/api/freeagent/timeslips?from_date='+firstDay.format(faDateFormat)+'&to_date='+lastDay.format(faDateFormat)).success(function(data){
      var timeSlips = data;
      var index;

      console.log(database);

      for(index in data.timeslips) {
        var timeslip = data.timeslips[index]

        console.log(timeslip.dated_on, timeslip.hours)
        var obj = database[timeslip.dated_on];

        if(obj){
          obj.hours = timeslip.hours
        }
      }
    })
  });
