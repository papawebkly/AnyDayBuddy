(function() {
  'use strict';

  angular
    .module('adbionic')
    .factory('ParentalService', ParentalService);

  ParentalService.$inject = ['BaseApiUrl', '_', 'moment', '$http', '$q', '$rootScope'];

  function ParentalService(BaseApiUrl, _, moment, $http, $q, $rootScope) {
    var service = {
      acceptRequest: acceptRequest,
      rejectRequest: rejectRequest
    };

    return service;

    function acceptRequest(payload) {
      var deferred = $q.defer();
      $http.put(BaseApiUrl + '/parental/' + payload.invitation + '/accept')
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function rejectRequest(payload) {
      var deferred = $q.defer();
      $http.put(BaseApiUrl + '/parental/' + payload.invitation + '/reject')
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }
  }
})();
