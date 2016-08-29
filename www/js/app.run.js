angular.module('adbionic')

.run(function($rootScope, $ionicPlatform, $cordovaKeyboard, $cordovaStatusbar, $state, $ionicHistory, LocalService, Auth, SocketService) {

    $ionicPlatform.ready(function() {
        if (!window.cordova) return;
        $cordovaKeyboard.hideAccessoryBar(true);
        $cordovaKeyboard.disableScroll(true);
        $cordovaStatusbar.style(0);
    });


    $rootScope.$on('$stateChangeSuccess', function(event, toState) {
        var authStates = ['login', 'resetPassword'];
        $rootScope.currentState = toState.name;
        $rootScope.isAuthenticated = Auth.isAuthenticated();

        if (Auth.isAuthenticated()) {
            $rootScope.isAuthenticated = true;
            $rootScope.user = JSON.parse(LocalService.get('user'));
        }

        if (toState.name == 'validate' && Auth.isAuthenticated()) {
            $rootScope.view = 'main';
            return;
        }

        if (toState.name == 'validate' && !Auth.isAuthenticated()) {
            $rootScope.view = 'auth';
            return;
        }

          /**
           * if the state does not requires authentication and the
           * user is logged in, redirect to the dashboard page.
           */
        if (!toState.authenticate && Auth.isAuthenticated() && $rootScope.user.completedSignup) {
            console.log('authenticated');
            event.preventDefault();
            $state.transitionTo('app.dashboard');
            $rootScope.currentState = 'app.dashboard';
        }

          /**
           * if the state requires authentication and the
           * user is not logged in, redirect to the login page.
           */
        if (toState.authenticate && !Auth.isAuthenticated()) {
            console.log('not auth');
            event.preventDefault();
            LocalService.unset('user');
            $state.transitionTo('login');
            $rootScope.currentState = 'login';
        }

        $rootScope.view = authStates.indexOf($rootScope.currentState) >= 0 ? 'auth' : 'main';
  });
})