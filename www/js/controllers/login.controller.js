angular.module('adbionic')

.controller('LoginCtrl', function($scope, $state, $rootScope, $ionicPopup, Auth, UserService, UtilService) {
	console.log('Login');
	$scope.formLogin = {};
  $scope.loading = false;
  var days = 7;

  activate();
	//////
  
  function activate() {
    UtilService.getSettings().then(function(resp) {
      days = resp.settings.maxDaysToActivateAccount;
    });
  }
	
	$scope.loginAttempt = function() {
    $scope.error = false;
    $scope.loading = true;
    Auth.login($scope.formLogin).then(function(resp) {
        $rootScope.user = resp.user;
        if (!resp.user.userValidated && moment().diff(moment(resp.user.createdAt), 'day') > days) {
            $rootScope.userEmail = resp.user.email;
        } else {
            UserService.setLogin();
            if (!$scope.user.completedSignup) {
                $state.go('completesignup');
            } else {
              $state.go('app.dashboard');
            }
        }
    }, function(err) {
        var alertPopup = $ionicPopup.alert({
            title: 'Ups!',
            template: 'User or password invalid'
        });

        alertPopup.then(function(res) {
            console.log('User or password invalid');
        });
    }).finally(function() {
      $scope.loading = false;
    });
  };
});
