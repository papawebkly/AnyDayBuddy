angular.module('adbionic')

.controller('DashboardCtrl', function($scope, $state, $rootScope, UserService, ActivityService, FriendshipService, GroupService) {
	console.log('Dashboard');
    $scope.loading_buddies = false;
    $scope.loading_groups = true;
    $scope.buddies = FriendshipService.buddies;
    $scope.invites = ActivityService.invites;
    $scope.activities = ActivityService.searches;
    $scope.new_search = {
        vibe: true,
        category: 'social',
        activities: [],
        type: 'public',
        participants: []
    };
    // $scope.categories = ['social'];
    activate();

	/////

    function activate() {
        $scope.user = $rootScope.user;
        $rootScope.$broadcast('categoryChanged', {category: $scope.new_search.category});

        if (!$scope.user.completedSignup) {
    	   $state.go('completesignup', {}, {reload:true});
        }

        UserService.resume()
            .then(function(resp) {
                _.map(resp, function(obj, key) {
                $rootScope.user[key] = obj.count;
            });
        });

        // Upcoming Events
        $scope.loading_events = true;
        ActivityService.getEvents({
            initDate: moment().startOf('day'),
            endDate: moment().endOf('day')
        })
        .then(function(resp) {
          //activities - categories
            $scope.today_events = [];
            if (resp.activities.length == 0) {
                $scope.loading_events = false;
            }
            $scope.events = resp.activities;
            var categories = resp.categories;
            for (var i = 0; i < $scope.events.length; i++) {
                if ($scope.events[i].date == moment().format('YYYY-M-DD')) {
                    $scope.today_events = angular.copy($scope.events[i].events);
                    break;
                }
            }
            for (var i = 0; i < $scope.today_events.length; i++) {
                $scope.today_events[i].name = categories[$scope.today_events[i].name];
            }
            $scope.loading_events = false;
        });

        if ($scope.adbBuddies) {
            $scope.buddies = $scope.adbBuddies.friends;
            $scope.userView = true;
            return;
        }

        if (!$scope.buddies.length) getMyBuddies();

        GroupService.init().then(function() {
            $scope.groups = GroupService.groups;
            for (var i = 0; i < $scope.groups.length; i++) {
                for (var id in $scope.groups[i].members) {
                    $scope.groups[i].status = $scope.groups[i].members[id].status
                }
            }
            $rootScope.user.groups = $scope.groups;
            $scope.loading_groups = false;
        });

        $scope.loading_search = true;

        if ($scope.adbSearches) {
            $scope.activities = $scope.adbSearches.activities;
            $scope.userView = true;
            $scope.loading_search = false;
            return;
        }

        if (!$scope.activities.length) {
            ActivityService.getSearches({}).then(function(resp) {
                $scope.loading_search = false;
            });
        } else {
            $scope.loading_search = false;
        }

        if (!$scope.invites.length)
            ActivityService.getSearchesInvited();
    }

    function getMyBuddies() {
        $scope.loading_buddies = true;
        FriendshipService.getMyBuddies()
          .finally(function() {
            $scope.loading_buddies = false;
          });
    }

    $scope.selectCategory = function(category) {
        $scope.new_search.category = category;
        $rootScope.$broadcast('categoryChanged', {category: category});
    }

  // function getCategories() {
  //   $scope.loadingCategories = true;
  //   ActivityService.getCategories($scope.new_search.category).then(function(resp) {
  //     $scope.categories = resp.subcategories;
  //   }).finally(function() {
  //     $scope.loadingCategories = false;
  //   });
  // }

});
