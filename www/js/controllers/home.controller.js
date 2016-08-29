angular.module('adbionic')

.controller('HomeCtrl', function($scope, $state) {
  setTimeout(function(){ 
  	$state.go('login');
  }, 3000);
});
