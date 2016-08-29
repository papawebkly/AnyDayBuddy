(function() {
  'use strict';

  angular
    .module('adbionic')
    .factory('Auth', Auth)
    .factory('AuthInterceptor', AuthInterceptor)
    .config(function($httpProvider) {
      $httpProvider.interceptors.push('AuthInterceptor');
      $httpProvider.defaults.withCredentials = true;
    });

  Auth.$inject = ['BaseApiUrl', '$http', '$q', '$state', '$rootScope', 'LocalService'];

  function Auth(BaseApiUrl, $http, $q, $state, $rootScope, LocalService) {

    var Auth = {
      validate: validate,
      authorize: authorize,
      isAuthenticated: isAuthenticated,
      login: login,
      logout: logout,
      register: register,
      forgot: forgot,
      reset: reset,
      setCredentials: setCredentials,
      setOriginalUser: setOriginalUser,
      restoreOriginal: restoreOriginal,
      hasOriginal: hasOriginal,
      credentialAvaliability: credentialAvaliability,
    };

    return Auth;

    function validate(token) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/auth/validate/' + token)
        .success(function(resp) {
          deferred.resolve(resp);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    /**
     * [login description]
     * @method login
     * @return {[type]} [description]
     */
    function login(credentials) {
      var deferred = $q.defer();

      $http.post(BaseApiUrl + '/auth/login', credentials)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
          if (data.hasOwnProperty('token')) {
            angular.copy(data.user, $rootScope.user);
            LocalService.set('access_token', data.token);
            LocalService.set('user', JSON.stringify(data.user));
          }
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    /**
     * [register description]
     * @method register
     * @return {[type]} [description]
     */
    function register(payload) {

      var deferred = $q.defer();

      $http.post(BaseApiUrl + '/auth/register', payload)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
          setCredentials(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }


    /**
     * [register description]
     * @method reset
     * @return {[type]} [description]
     */
    function reset(token, params) {
      var deferred = $q.defer();

      $http.post(BaseApiUrl + '/auth/resetpassword/' + token, params)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    /**
     * [register description]
     * @method forgot
     * @return {[type]} [description]
     */
    function forgot(payload) {
      var deferred = $q.defer();

      $http.post(BaseApiUrl + '/auth/resetPasswordRequest', payload)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    /**
     * [logout description]
     * @method logout
     * @return {[type]} [description]
     */
    function logout() {
      LocalService.unset('access_token');
      LocalService.unset('user');
      $rootScope.isAuthenticated = false;
      $rootScope.user = null;
      $rootScope.currentState = 'login';
      $state.go('login', {}, { reload: true });
    }

    /**
     * [setCredentials description]
     * @method authenticate
     * @param  {[type]}     user [description]
     * @return {[type]}          [description]
     */
    function setCredentials(data, force) {
      if (force) setOriginalUser();

      if (data.hasOwnProperty('token')) {
        if (force || !LocalService.get('access_token')) {
          LocalService.set('access_token', data.token);
        }
        $rootScope.user = data.user;
        LocalService.set('user', JSON.stringify(data.user));
      } else {
        console.log('Bad Date', data);
      }
    }

    function setOriginalUser() {
      LocalService.set('orginal_access_token', LocalService.get('access_token'));
      LocalService.set('orginal_user', LocalService.get('user'));
    }

    function restoreOriginal() {
      LocalService.set('access_token', LocalService.get('orginal_access_token'));
      LocalService.set('user', LocalService.get('orginal_user'));
      LocalService.unset('orginal_access_token');
      LocalService.unset('orginal_user');

      $rootScope.user = JSON.parse(LocalService.get('user'));
    }

    function hasOriginal() {
      return LocalService.get('orginal_access_token');
    }

    /**
     * [isAuthenticated description]
     * @method isAuthenticated
     * @return {Boolean}       [description]
     */
    function isAuthenticated() {
      if (LocalService.get('access_token')) {
        var token = LocalService.get('access_token');
        return true;
      }
      return false;
    }

    /**
     * [authorize description]
     * @method authorize
     * @return {[type]}  [description]
     */
    function authorize() {

    }

    /** Signup Process **/
    /**
     * [credentialAvaliability description]
     * @method credentialAvaliability
     * @return {[type]}               [description]
     */
    function credentialAvaliability(payload) {
      var deferred = $q.defer();

      $http.get(BaseApiUrl + '/user/availability/', {
          params: payload
        })
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }
  }

  /**
   * [AuthInterceptor description]
   * @method AuthInterceptor
   */
  function AuthInterceptor($q, LocalService, $injector) {

    var AuthInterceptor = {
      request: request,
      responseError: responseError
    };

    return AuthInterceptor;

    function request(config) {

      var token;
      if (LocalService.get('access_token')) {
        token = LocalService.get('access_token');
      }
      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
    }

    function responseError(response) {
      if (response.status === 401 || response.status === 403) {
        LocalService.unset('access_token');
        $injector.get('$state').transtionTo('login');
      }
      return $q.reject(response);
    }

  }
})();
