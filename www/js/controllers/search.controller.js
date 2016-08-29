angular.module('adbionic')

.controller('SearchCtrl', function($scope, $rootScope, ActivityService) {
  	// $scope.invites = ActivityService.invites;

  	$scope.categories = ['handy', 'social', 'active'];
    activate();

    /////

    function activate() {
        $scope.activities = [];
        $scope.activities_archived = [];
    	$scope.loading_search = true;
        ActivityService.getSearches({}).then(function(resp) {
            for (var i = 0; i < resp.activities.length; i++) {
                if (resp.activities[i].archived) {
                    $scope.activities_archived.push(resp.activities[i])
                } else {
                    $scope.activities.push(resp.activities[i])
                }
            }
			$scope.aux_activities = angular.copy($scope.activities);
            $scope.loading_search = false;
      });
    }

    $scope.selectCategory = function(category) {
    	var index = $scope.categories.indexOf(category);
    	if (index > -1) {
    		$scope.categories.splice(index, 1);
    	} else {
    		$scope.categories.push(category);
    	}
    	clearActivities();
    }

    function clearActivities() {
    	var aux = []
    	for (var i = 0; i < $scope.activities.length; i++) {
    		if ($scope.categories.indexOf($scope.activities[i].category) > -1) {
    			aux.push($scope.activities[i]);
    		}
    	}
    	$scope.aux_activities = aux;
    }

    $rootScope.$on('newSearch', function(event, args) {
        activate();
    });
 });
