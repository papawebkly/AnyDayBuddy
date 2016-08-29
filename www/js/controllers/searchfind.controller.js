angular.module('adbionic')
.controller('SearchFindCtrl', function($scope, $rootScope, $timeout, uiGmapGoogleMapApi, uiGmapIsReady) {
	var Places = null;
	var PlacesAutocomplete = null;
  	$scope.placesReady = false;
	$scope.map = {
	    center: {
	      latitude: 45.50174502816667,
	      longitude: -73.5703881829977
	    },
	    zoom: 14,
	    options: {
	      scrollwheel: false
	    },
	    mapMarker: true,
	    disableDefaultUI: true,
	    control: {}
	};
  	$scope.data = {};
    var format = 'DD/MM/YYYY hh:mm a';
    var start = "#datetimepicker-start";
    var end = "#datetimepicker-end";
	activateMap();

  	function activateMap() {
	    uiGmapGoogleMapApi.then(function(maps) {
	      	PlacesAutocomplete = new maps.places.AutocompleteService();

	      	uiGmapIsReady.promise(1).then(function(instances) {
		        $scope.placesReady = true;
		        $scope.map.instance = instances[0].map;
		        Places = new maps.places.PlacesService($scope.map.instance);
	      	});
	    });
  	}

  	$scope.getLocation = function() {
    	if (!$scope.new_search.addressPlace) return;

    	Places.getDetails({ placeId: $scope.new_search.addressPlace.place_id }, function(place, status) {
      		$scope.new_search.location = place.geometry.location;
		});
  	};

  	$scope.setLocation = function(item) {
  		$scope.new_search.addressPlace = item;
  		$scope.new_search.address = item.description;
  		$scope.places = [];
  		$scope.getLocation();
  	}

  	$scope.autocompleteAddress = function(address) {
	    if (address) {
		    PlacesAutocomplete.getQueryPredictions({ input: address }, function(data) {
	      		$scope.places = data;
	    	});
	    }
  	};

	$scope.clickActivity = function(activity) {
	    var exist = _.findIndex($scope.new_search.activities, activity);
	    if (exist > -1) {
	      $scope.new_search.activities.splice(exist, 1);
	      activity.added = false;
	    } else if ($scope.new_search.activities.length < 5) {
	      $scope.new_search.activities.push(activity);
	      activity.added = true;
	    }
  	}

  	// $scope.clickBuddy = function(buddy) {
	  //   var exist = _.findIndex($scope.new_search.participants, buddy);
	  //   if (exist > -1) {
	  //     $scope.new_search.participants.splice(exist, 1);
	  //   } else {
	  //     $scope.new_search.participants.push(buddy);
	  //   }
  	// }

  	// $scope.checkBuddy = function(buddy) {
	  //   return _.findIndex($scope.new_search.participants, buddy) > -1;
  	// }

	// Date Time Picker
  	$scope.now = function() {
	    $scope.startDate = moment().format(format);
	    $(start).data("DateTimePicker").date($scope.startDate);
  	};

  	$scope.until = function() {
	    $scope.active = false;

	    $timeout(function() {
	      $scope.endDate = 'Until Further Notice';
	    }, 0);
  	};
})