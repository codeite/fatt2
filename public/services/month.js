angular.module("fatt")
  .factory("month", [function() {
    var faDateFormat = "YYYY-MM-DD";

  	var calcMonth = function(month, addRecordLike, database, today) {

  		var offset = month.isoWeekday() - 1
    	var firstDay = month.clone().subtract(offset, 'days')
    	var currentDate = firstDay.clone();
    	var lastDay = firstDay.clone().add(6, 'weeks')

	  	var weeks = []

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

	    return {
	      weeks: weeks,
        firstDay: firstDay,
        lastDay: lastDay
	    }
    }

    return {
      calcMonth: calcMonth,
      faDateFormat: faDateFormat
    }

  }]);