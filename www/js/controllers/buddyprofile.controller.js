angular.module('adbionic')
.controller('BuddyProfileCtrl', function($scope, $rootScope, $state, LocalService, FriendshipService, ConversationsService) {

	$scope.new_buddy = {};

    $scope.openChat = function(buddyId, hide) {
    	$scope.hideModalProfile();
    	LocalService.set('fromChat', buddyId);
    	$state.go('app.chats', {}, {reload: true});
    };

	//Add Buddy
  	$scope.invite = function() {
	    $scope.loading = true;
	    $scope.loadingText = 'Sending invitation...';

	    // type: 1 for map, 0 for buddyNumber
	    FriendshipService.invite({ userId: $scope.selected_buddy.id, type: 0 })
	      .then(function(resp) {
	        $scope.message = 'Invitation sent';
	        $scope.hideModalProfile();
	      }, function(err) {
	        console.log(err);
	      })
	      .finally(function() {
	        $scope.loading = false;
	      });
  	};

  //Block Buddy
  	$scope.blockBuddy = function() {
	    FriendshipService.remove($scope.selected_buddy, true).finally(function() {
	      $scope.selected_buddy = {};
	      $scope.hideModalProfile();
	    });
  	}

  //Remove Buddy
  	$scope.unbuddy = function() {
	    FriendshipService.remove($scope.selected_buddy, false).finally(function() {
	      $scope.selected_buddy = {};
	      $scope.hideModalProfile();
	    });
  	}

  //Search Buddy
  	$scope.searchBuddy = function() {
	    $scope.loading = true;
	    $scope.message = null;
	    $scope.loadingText = 'Searching...';
	    FriendshipService.search({ buddyNumber: $scope.new_buddy.buddyNumber })
	      .then(function(resp) {
	        if (resp.friendshipData.isMyBuddy) {
	          $scope.message = resp.user.fullname + ' is already your buddy!';
	        } else if (resp.friendshipData.requestAlreadySent) {
	          $scope.selected_buddy  = angular.copy(resp.user);
	          $scope.message = 'Waiting for Buddyship';
	        } else {
	          if (resp.notFound) {
	            $scope.selected_buddy = angular.copy(resp.notFound.relatedUser);
	            $scope.canInvite = true
	          } else {
	            $scope.selected_buddy = angular.copy(resp.user);
	            $scope.canInvite = true
	          }
	        }
			$scope.new = false;

	      })
	      .finally(function() {
	        $scope.loading = false;
	      });
  	};
})