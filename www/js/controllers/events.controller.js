angular.module('adbionic')

.controller('EventsCtrl', function($scope, $state, $rootScope, ActivityService) {
	var format = 'MMMM';
	var startDate = moment().startOf('month');
	var endDate = moment().endOf('month');
	$scope.month = startDate.format(format);
	$scope.activities_month = [];
	var categories = {};
	var activities_further = [];

	activate();

	///
	function activate() {
		$scope.loading_events = true;
	    ActivityService.getEvents({
	      initDate: startDate,
	      endDate: endDate
	    })
	    .then(function(resp) {
	      //activities - categories
	      	$scope.new_activities = [];
	      	$scope.activities = resp.activities;
	      	categories = resp.categories;
	      	var aux_start = startDate.clone();
	      	while (aux_start.isBefore(endDate)) {
		      	for (var i = 0; i < $scope.activities.length; i++) {
		      		if (aux_start.format('YYYY-M-DD') == $scope.activities[i].date) {
			      		$scope.activities[i].date = moment($scope.activities[i].date, 'YYYY-M-DD').format('dddd, DD');
			      		$scope.activities_month.push($scope.activities[i]);
			      		for (var j = 0; j < $scope.activities[i].events.length; j++) {
			      			if ($scope.activities[i].events[j].endDate == -1) {
			      				activities_further.push($scope.activities[i].events[j]);
			      				$scope.activities[i].events.splice(j, 1);
			      			}
			      		}
				      	$scope.activities[i].events = $scope.activities[i].events.concat(activities_further);
				    	break;
				    }
	      		}
	      		$scope.new_activities.push({ 
	      			date: aux_start.format('dddd, DD'),
	      			events: activities_further
	      		})

		      	aux_start.add(1, 'day');
	      	}
	      	console.log('...', $scope.new_activities)
	      	$scope.loading_events = false;
	    });
	}

	$scope.getActivityName = function(categoryId) {
		return categories[categoryId].name;
	}

	$scope.next = function() {
		startDate = startDate.add(1, 'months').startOf('month');
		endDate = startDate.clone().endOf('month');
		$scope.month = startDate.format(format);
		$scope.activities_month = [];
		activate();
	}

	$scope.prev = function() {
		startDate = startDate.subtract(1, 'months').startOf('month');
		endDate = startDate.clone().endOf('month');
		$scope.month = startDate.format(format);
		$scope.activities_month = [];
		activate();
	}
});
