(function() {
  'use strict';

  angular.module('adbionic').
  factory('interceptorsService', interceptorsService);

  interceptorsService.$inject = ['$q'];

  function interceptorsService($q) {
    var interceptor = {
      'request': function(config) {

        return config;
      },
      'response': function(response) {
        return response;
      },
      'responseError': function(rejection) {
        console.log(rejection.data);
        if (rejection.status === 401) {
          console.log('unauthorized');
        }
        return $q.reject(rejection);
      },
      'requestError': function(rejection) {
        console.log(rejection);
        return $q.reject(rejection);
      },
    };

    return interceptor;
  }
})();
