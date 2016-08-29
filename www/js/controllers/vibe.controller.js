angular.module('adbionic')

.controller('VibeCtrl', function($scope, $state, $rootScope, $timeout,
	uiGmapGoogleMapApi, uiGmapIsReady, UtilService, ActivityService) {

    $scope.radius = 0;
    $scope.bounds = null;
    $scope.marker = null;
    $scope.loading = true;
    $scope.activity = null;
    $scope.activities = [];
    $scope.participants = {};
    $scope.mapVisible = false;
    $scope.allActivities = [];
    $scope.filter = {
      categories: UtilService.getCategories(),
      selectedCategories: []
    };
    $scope.isOffering = false;
    $scope.map = {
      center: {
        latitude: 45.50174502816667,
        longitude: -73.5703881829977
      },
      zoom: 14,
      options: {
        scrollwheel: false
      },
      control: {},
      events: { idle: boundsChanged }
    };

    activate();

    ////////////////

    function activate() {
      	uiGmapGoogleMapApi.then(function(maps) {
	        uiGmapIsReady.promise(1).then(function(instances) {
	          	$scope.map.instance = instances[0].map;
	          	$scope.bounds = $scope.map.instance.getBounds();
	          	vibe();
	        });
      	});
    }

    function vibe() {
      	UtilService.getLocation()
	        .then(function(location) {
	          $scope.location = location;
	          centerMap($scope.map.instance, $scope.location);
	        }).finally(function() {
	          $scope.mapVisible = true;
	        });
    }

    $scope.resetFilter = function() {
      	$scope.filter = {
	        categories: UtilService.getCategories(),
	        selectedCategories: []
      	};
    };

    $scope.markerClick = function(marker, eventName, model) {
      	if (!model.hasOwnProperty('text') &&
	        !angular.isObject(model.activities[0].name)) {
	        model.activities = ActivityService.populateCategory($scope.categories, model.activities);
      	}

      	$scope.marker = model;
      	$scope.marker.current = {};
      	$scope.marker.show = !$scope.marker.show;
    };

    $scope.updateMap = function(key, category) {
      	$scope.activity = key;
      	$scope.activities = ActivityService.mapMarkers($scope.users, category);
      	$scope.activities.push(locationMarker());
      	$scope.activities[$scope.activities.length - 1].id = $scope.activities.length - 1;
    };

    $scope.openActivity = function(activity) {
      	if (!angular.isObject(activity[0].name))
        	activity = ActivityService.populateCategory($scope.categories, activity);

      	$scope.marker = {
	        current: {},
	        location: {
	          latitude: activity[0].location[0],
	          longitude: activity[0].location[1]
	        },
	        activities: activity,
	        users: $scope.users,
	        show: $scope.marker ? (_.isEqual($scope.marker.activities, activity) ? !$scope.marker.show : true) : true
      	};

      	if ($scope.marker.show) {
	        centerMap($scope.map.instance, {
	          lat: $scope.marker.location.latitude,
	          lng: $scope.marker.location.longitude
	        }, true);
      	}
    };

    $scope.closeActivity = function() {
      	$scope.activity = null;
      	angular.copy($scope.allActivities, $scope.activities);

      	if ($scope.marker)
        	$scope.marker.show = false;
    };

    $scope.participantsCount = function(location) {
      	var count = 0;
      	for (var i = location.length - 1; i >= 0; --i) {
        	count += location[i].participants.length;
      	}
      	return count;
    };

    $scope.joinTheVibe = function() {
      	var activity = $scope.marker.current;
      	addToBuddies(activity.requester);
      	ActivityService.join(activity._id).then(function(resp) {})
    };

    function addToBuddies(id) {
      	// type: 1 for map, 0 for buddyNumber
      	FriendshipService.invite({ userId: id, type: 1 })
	        .then(function(resp) {
	          UtilService.showToast('Invitation sent');
	        }, function(err) {
	          console.log(err);
	        });
    };

    function computeParticipants() {
      	var activities = [];

      	angular.forEach($scope.data, function(activity, key) {
	        var count = 0;

	        angular.forEach(activity, function(location, key) {
	          count += $scope.participantsCount(location) + location.length;
	        });

	        if ($scope.activity && $scope.activity == key)
	          $scope.updateMap($scope.activity, activity);

	        $scope.participants[key] = count;

	        activities.push(ActivityService.mapMarkers($scope.users, activity))
      	});

      	// Sorting data by number of participants
      	var sortable = [];
      	var aux = {};
      	for (var key in $scope.participants)
	        sortable.push([key, $scope.participants[key]])
	      		sortable.sort(function(a, b) {
	        	return b[1] - a[1]
      		})

      	for (var i = 0; i < sortable.length; i++) {
	        var key = sortable[i][0];
	        aux[key] = $scope.data[key];
      	}

      	$scope.data = aux;

      	$scope.allActivities = [].concat.apply([], activities);
      	$scope.allActivities.push(locationMarker());
      	$scope.allActivities.map(function(o, i) { o.id = i; })
      	if (!$scope.activity) angular.copy($scope.allActivities, $scope.activities);
    }

    function centerMap(map, location, offset) {
      	$timeout(function() {
	        map.panTo(location);
      	}, 100);
    }

    function locationMarker() {
      	return {
	        text: 'This is you!',
	        location: {
	          latitude: $scope.location.lat,
	          longitude: $scope.location.lng
	        },
	        icon: ActivityService.marker('green', 1)
      	}
    }

    function updateVibe() {
      	var params = {
	        startDate: moment().format(),
	        endDate: moment().format(),
	        categories: ['social', 'handy', 'active'],
	        lat: $scope.location.lat,
	        lng: $scope.location.lng,
	        radius: $scope.radius
      	};
      	$scope.loading = true;
      	ActivityService.vibe(params).then(function(resp) {
	        $scope.data = resp.vibe;
	        $scope.users = resp.users;
	        $scope.categories = resp.categories;
	        computeParticipants();
      	}).finally(function() {
        	$scope.loading = false;
      	});
    }

    function viewPortRadius() {
      	var r = 3963.0;
      	var ne = $scope.bounds.getNorthEast();
      	var center = $scope.bounds.getCenter();
        if (!$scope.location) return;
      	var lat1 = $scope.location.lat / 57.2958;
      	var lng1 = $scope.location.lng / 57.2958;
      	var lat2 = center.lat() / 57.2958;
      	var lng2 = center.lng() / 57.2958;

      	var centerDistance = r * Math.acos(Math.sin(lat1) * Math.sin(lat2) +
        	Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1));

      	lat2 = ne.lat() / 57.2958;
      	lng2 = ne.lng() / 57.2958;

      	var aperture = r * Math.acos(Math.sin(lat1) * Math.sin(lat2) +
        	Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1));

      	if (centerDistance + aperture > $scope.radius && aperture < 1000) {
        	$scope.radius = (centerDistance + aperture).toFixed(2);

        	updateVibe();
      	}
    }

    function boundsChanged() {
      	if (!$scope.map.instance) return;

      	$scope.bounds = $scope.map.instance.getBounds();
      	viewPortRadius();
    }


    // Trigger refresh when the map becomes visible
    $scope.$watch('mapVisible', function(current, original) {
      	if (!current || !angular.isObject($scope.map.control)) return;

      	$timeout(function() {
        	$scope.map.control.refresh();
      	}, 0);
    });


    var timeoutPromise;
    $scope.$watch('filter', function(current, original) {
    	console.log(current)
      	if (current == original || !$scope.location) return;
      	$timeout.cancel(timeoutPromise);
      	var categories = [];
      	var selectedCategories = current.selectedCategories;

      	timeoutPromise = $timeout(function() {
	        var params = {
	          startDate: current.startDate ? moment(current.startDate).format() : null,
	          endDate: current.endDate ? moment(current.endDate).format() : null,
	          categories: selectedCategories,
	          activity: current.search,
	          lat: $scope.location.lat,
	          lng: $scope.location.lng,
	          radius: $scope.radius,
	        };

        ActivityService.vibe(params).then(function(resp) {
          	$scope.data = resp.vibe;
          	$scope.users = resp.users;
          	$scope.categories = resp.categories;
          	$scope.participants = {};
          	$scope.data_original = angular.copy($scope.data);
          	computeParticipants();
        }).finally(function() {
          $scope.loading = false;
        });
      }, 500);

    }, true);

    $scope.$watch('$scope.isOffering', function(current, original) {
      	if (current == original) return;
      	if ($scope.filter.selectedCategories == 'handy') {
	        $scope.data_aux = {};
	        angular.forEach($scope.data_original, function(activity, key_activity) {
	          angular.forEach(activity, function(location, key) {
	            if (location[0].isOffering == $scope.isOffering) {
	              $scope.data_aux[key_activity] = $scope.data_original[key_activity];
	            }
	          });
	        });
	        $scope.data = angular.copy($scope.data_aux);
	        $scope.participants = {};
	        computeParticipants();
      	}
    })

});
