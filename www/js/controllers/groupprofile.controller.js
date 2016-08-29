angular.module('adbionic')
.controller('GroupProfileCtrl', function($scope,  $rootScope, GroupService) {
	
 	$scope.createGroup = function() {
	    $scope.loading = true;
	    var users = _.map($scope.new_members, function(contact) {
	      return contact.id;
	    });
	    var group = {};
	    group = angular.copy($scope.selected_group.room);
	    group.members = $scope.new_members;
	    group.users = users;
	    group.creator = $rootScope.user.id;
	    console.log(group);

	    GroupService.create(group).then(function(res) {
	      $scope.loading = false;
	      hideModalGroup();
	    });
  	};

  	$scope.updateGroup = function() {
	    $scope.loading = true;
	    GroupService.update(formatted($scope.selected_group.room)).then(function(res) {
	    	$scope.hideModalGroup();
	    }).finally(function() {
	      $scope.loading = false;
	    });
  	};

  	$scope.selectBuddy = function(buddy) {
	    buddy.invited = !buddy.invited;
	    var index = _.findIndex($scope.new_members, {id: buddy.id})
	    if (index > -1) {
	      $scope.new_members.splice(index, 1);
	    } else {
	      $scope.new_members.push(buddy);
	    }
  	}

 	//Format Group
  	function formatted(group) {
	    return {
	      id: group.id,
	      creator: $rootScope.user.id,
	      name: group.name,
	      isPrivate: group.isPrivate,
	      topic: group.topic,
	      roomImage: group.roomImage
	    };
  	}
})