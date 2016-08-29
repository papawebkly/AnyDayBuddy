(function() {
  'use strict';

  angular
    .module('adbionic')
    .factory('UserService', factory);

  factory.$inject = [
    'moment',
    'BaseApiUrl',
    'LocalService',
    'SocketService',
    '$q',
    '$http',
    '$rootScope'
  ];

  function factory(moment, BaseApiUrl, LocalService, SocketService, $q, $http, $rootScope) {
    var service = {
      detail: detail,
      update: update,
      resume: resume,
      status: status,
      buddies: buddies,
      blocked: blocked,
      unblock: unblock,
      setLogin: setLogin,
      activities: activities,
      changeUser: changeUser,
      changePassword: changePassword,
      readNotifications: readNotifications,
      resendVerification: resendVerification,
      listParental: listParental,
      sendRequestParental: sendRequestParental
    };

    return service;

    function detail(buddyNumber, id) {
      var deferred = $q.defer();
      var url = '/user/' + buddyNumber;

      if (id) url = '/account/' + id;

      $http.get(BaseApiUrl + url)
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    function activities(userId) {
      var deferred = $q.defer();

      $http.get(BaseApiUrl + '/user/' + userId + '/activities/')
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    function buddies(userId) {
      var deferred = $q.defer();

      $http.get(BaseApiUrl + '/user/' + userId + '/buddies/')
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    function setLogin() {
      $rootScope.user.lastLogin = moment().format();
      return update($rootScope.user.id, $rootScope.user);
    }

    function update(userId, payload) {
      var deferred = $q.defer();
      var url = BaseApiUrl + '/user/' + userId;
      $http.put(url, payload)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
          angular.copy(data, $rootScope.user);
          LocalService.set('user', JSON.stringify(data));
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function status(payload) {
      var deferred = $q.defer();
      var url = BaseApiUrl + '/user/status';
      $http.put(url, payload)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
          angular.copy(data, $rootScope.user);
          LocalService.set('user', JSON.stringify(data));
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function changeUser(buddyNumber) {
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/user/control/' + buddyNumber)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function changePassword(payload) {
      var deferred = $q.defer();
      var url = BaseApiUrl + '/auth/changePassword';
      $http.post(url, payload)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function resume() {
      var deferred = $q.defer();
      var url = BaseApiUrl + '/user/resume/';
      $http.get(url)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function readNotifications(params) {
      var deferred = $q.defer();
      var url = BaseApiUrl + '/user/notifications/';
      $http.put(url, params)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function resendVerification() {
      var deferred = $q.defer();
      var url = BaseApiUrl + '/auth/validationEmail/';
      $http.post(url)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function blocked() {
      var deferred = $q.defer();
      var url = BaseApiUrl + '/user/blocked/';
      $http.get(url)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function unblock(params) {
      var deferred = $q.defer();
      var url = BaseApiUrl + '/user/unblock/' + params.user;
      $http.post(url)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function listParental() {
      var deferred = $q.defer();
      var url = BaseApiUrl + '/user/parental/';
      $http.get(url)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function sendRequestParental(params) {
      var deferred = $q.defer();
      var url = BaseApiUrl + '/parental/';
      $http.post(url, params)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

  }
})();
