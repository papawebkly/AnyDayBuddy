angular.module('adbionic')

.controller('NotificationsCtrl', function($scope, $state, $rootScope, $ionicPopup, UserService, NotificationService) {
  $scope.readed = [];
  $scope.notifications = NotificationService.list;
  clearNotifications();
    ////////////////

  $scope.handle = function(item, cancel) {
    item._loading = true;
    NotificationService[item.handler](item, cancel).then(function(resp) {
      item._loading = false;
      var index = _.findIndex($scope.notifications, function(o) {
        return o.id == item.id;
      });

      $scope.notifications[index].readed = true;
      UserService.readNotifications({
        ids: [item.id]
      });

      if (item.type == 'groupInvitation' && !cancel)
        $rootScope.$emit('updateGroups');
    });
  };

	$scope.showConfirm = function(item) {
   		var confirmPopup = $ionicPopup.confirm({
		  title: 'Do you want to accept this request or invitation?', // String. The title of the popup.
		  cssClass: 'popup-confirmation', // String, The custom CSS class name
		  cancelText: 'No', // String (default: 'Cancel'). The text of the Cancel button.
		  okText: 'Yes', // String (default: 'OK'). The text of the OK button.
		  okType: 'button-next'
		});

   		confirmPopup.then(function(res) {
	     	if(res) {
		       $scope.handle(item);
	     	} else {
		       $scope.handle(item, true);
	     	}
	   });
	};

  function clearNotifications() {
    if (!$scope.notifications.length) return;

    $scope.readed = [];
    for (var i = 0; i < $scope.notifications.length; ++i) {
      if (!$scope.notifications[i].isInvitation) {
        $scope.readed.push($scope.notifications[i].id);
        $scope.notifications[i].readed = true;
      }
    }

    UserService.readNotifications({
      ids: $scope.readed
    }).then(function(resp) {
      console.log(resp);
    });
  }
});