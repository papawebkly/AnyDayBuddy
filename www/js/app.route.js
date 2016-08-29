angular.module('adbionic')

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'AppCtrl',
    authenticate: false
  })
  .state('app.dashboard', {
    url: '/dashboard',
    views: {
      'dashboard': {
        templateUrl: 'templates/dashboard.html',
        controller: 'DashboardCtrl'
      }
    },
    authenticate: true
  })
  .state('app.buddies', {
    url: '/buddies',
    views: {
      'buddies': {
        templateUrl: 'templates/buddies.html',
        controller: 'BuddiesCtrl'
      }
    },
    authenticate: true
  })
  .state('app.search', {
    url: '/search',
    views: {
      'search': {
        templateUrl: 'templates/search.html',
        controller: 'SearchCtrl'
      }
    },
    authenticate: true
  })
  .state('app.notifications', {
    url: '/notifications',
    views: {
      'notifications': {
        templateUrl: 'templates/notifications.html',
        controller: 'NotificationsCtrl'
      }
    },
    authenticate: true
  })
  .state('app.chats', {
    url: '/chats',
    views: {
      'chats': {
        templateUrl: 'templates/chats.html',
        controller: 'ChatsCtrl'
      }
    },
    authenticate: true
  })

  
  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl',
    authenticate: false
  })
  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SignUpCtrl',
    authenticate: false
  })
  .state('completesignup', {
    url: '/completesignup',
    templateUrl: 'templates/completesignup.html',
    controller: 'SignUpCtrl',
    authenticate: true
  })
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl',
    authenticate: false
  });

  $urlRouterProvider.otherwise('/home');
});