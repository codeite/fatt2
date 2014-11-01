angular.module('fatt',[])
  .controller('MainCtrl', function($scope) {
    var today = moment().utc();
    $scope.today = today.day();

    var month = today.clone().startOf('month')

    $scope.month = month
    $scope.monthName = month.format("MMMM")

    var offset = (month.day()+6) % 7
    var currentDay = month.clone().subtract(offset, 'days')


    var weeks = []
    while (currentDay.month() <= month.month()) {
      var week = []
      for (var i=0; i<7; i++) {
        week.push(currentDay.date())
        currentDay.add(1, 'days')
      }
      weeks.push(week)
    }
    console.log(weeks)
    $scope.weeks = weeks
  });
