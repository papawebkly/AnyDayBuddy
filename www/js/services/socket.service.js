(function() {
  'use strict';

  angular
    .module('adbionic')
    .factory('SocketService', factory);

  factory.$inject = ['BaseApiUrl', 'LocalService', 'io', '$q'];

  function factory(BaseApiUrl, LocalService, io, $q) {
    var service = {
      init: init,
      connection: null,
      disconnect: disconnect,
      subscribe: subscribe,
      handle: handle,
      subscribed: false,
      get: get,
      request: request
    };

    return service;

    function init() {
      io.sails.autoConnect = false;
      //service.connection.autoConnect = false;
      //io.sails.environment = 'production';
      service.connection = io.sails.connect(BaseApiUrl, {
        forceNew: true
      });
      handle();
    }

    function handle() {
      service.connection.on('connect', function(err, res) {
        //service.connection = io.sails.connect(BaseApiUrl, {forceNew: true});

        if (!service.subscribed) {
          service.subscribe('/user/subscribe/').then(function(res) {
            service.subscribed = true;
          });
        }

      });

      service.connection.on('disconnect', function(err, res) {
        console.log('disconnected to socket service');
        console.log(err, res);
        service.subscribed = false;
      });

      service.connection.on('reconnecting', function(numAttempts) {
        console.log('reconnecting to socket service');
      });


    }

    function disconnect() {
      console.log('disconnecting');
      var deferred = $q.defer();
      var token = LocalService.get('access_token');
      service.get('/user/unsubscribe/').then(function(res) {
        console.log('unsubscribed to', res);
        deferred.resolve(res);
      });

      return deferred.promise;
    }


    function subscribe(url) {
      var deferred = $q.defer();
      var token = LocalService.get('access_token');
      service.connection.get(BaseApiUrl + url + '?token=' + token, null, function(response) {
        deferred.resolve(response);
      });

      return deferred.promise;
    }

    function get(url, params) {
      var deferred = $q.defer();
      var token = LocalService.get('access_token');
      service.connection.get(BaseApiUrl + url + '?token=' + token, params, function(response) {
        deferred.resolve(response);
      });

      return deferred.promise;
    }

    function request(method, url, params, cb){
      var token = LocalService.get('access_token');
      service.connection.request({
        method: method,
        url: url,
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }, cb);
    }

    function EncodeQueryData(data) {
      var ret = [];
      for (var d in data)
        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
      return ret.join("&");
    }

  }
})();
