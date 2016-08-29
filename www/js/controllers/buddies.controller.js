angular.module('adbionic')

.controller('BuddiesCtrl', function($scope, $state, $rootScope, $ionicModal, GroupService, 
  UserService, FriendshipService) {
	  console.log('Buddies');
    $scope.loading_buddies = false;
    $scope.loading_groups = true;
    $scope.userView = false;
    $scope.buddies = FriendshipService.buddies;
    $scope.new_buddy = {
      loading: false
    };    
    $scope.new_group = {
      loading: false
    };
    $scope.user = {};

    activate();

    ////////////////

    function activate() {
      if ($scope.adbBuddies) {
        $scope.buddies = $scope.adbBuddies.friends;
        $scope.userView = true;
        return;
      }

      if (!$scope.buddies.length) getMyBuddies();

      if ($rootScope.user && $rootScope.user.birth) {
        var birthday = moment($rootScope.user.birth);
        $scope.user.hasParental = moment().diff(birthday, 'year') >= 18 ? true : false;
      }

      GroupService.init().then(function() {
        $scope.groups = GroupService.groups;
        for (var i = 0; i < $scope.groups.length; i++) {
          for (var id in $scope.groups[i].members) {
            $scope.groups[i].status = $scope.groups[i].members[id].status;
          }
        }
        console.log($scope.groups)
        $scope.loading_groups = false;
      });
    }

  $scope.accept = function(item, relationship) {
    $scope.new_buddy.loading = true;
    $scope.new_buddy.loadingText = 'Accepting invitation...';
    FriendshipService.accept({
        id: relationship
      })
      .then(function(resp) {
        $scope.new_buddy.message = 'Congralutations! You are buddies now, start a chat message with your new buddy';
        $scope.new_buddy.finished = true;
      })
      .finally(function() {
        getMyBuddies();
      });
  };

  function getMyBuddies() {
    $scope.loading_buddies = true;
    FriendshipService.getMyBuddies()
      .finally(function() {
        $scope.loading_buddies = false;
      });
  }

});