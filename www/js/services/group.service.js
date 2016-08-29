(function() {
  'use strict';

  angular
    .module('adbionic')
    .factory('GroupService', GroupService);

  GroupService.$inject = ['_', 'BaseApiUrl', '$q', '$http', 'ConversationsService', 'SocketService'];

  function GroupService(_, BaseApiUrl, $q, $http, ConversationsService, SocketService) {
    var service = {
      group: {
        name: '',
        members: [],
        isPrivate: false,
        topic: 'social'
      },
      rooms: [],
      groups: [],
      acceptInvitation: acceptInvitation,
      delete: deleteFn,
      create: create,
      update: update,
      invite: invite,
      clear: clear,
      kick: kick,
      init: init,
      open: open,
      get: get,
      set: set,
    };

    return service;

    function init() {
      var promise = SocketService.get('/group/');

      return promise.then(function(res) {
        angular.copy(res, service.groups);
        //console.log('',service.groups);
        angular.copy(_.map(res, function(item) {
          return item.room;
        }), service.rooms);
        console.log('Groups', service.rooms);
        //ConversationsService.conversations.push(service.rooms);

      });

    }

    function create(payload) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/group/', payload)
        .success(function(data) {
          service.groups.push(data);
          ConversationsService.push(data.room);
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }


    function update(payload) {
      var deferred = $q.defer();
      $http.put(BaseApiUrl + '/group/', payload)
        .success(function(data) {
          service.get();
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function deleteFn(payload) {
      var deferred = $q.defer();
      $http.delete(BaseApiUrl + '/group/', { data: payload })
        .success(function(data) {
          service.groups.splice(_.findIndex(service.groups, function(o) {
            return o.room.id == data.id;
          }), 1);
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function invite(payload) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/group/invite/', payload)
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function kick(payload) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/group/kick/', payload)
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function get() {
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/group/')
        .success(function(data) {
          angular.copy(data, service.groups);
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function set(group) {
      group.existing = true;
      group.name = group.room.name;
      group.topic = group.room.topic;
      group.isPrivate = group.room.isPrivate;
      group.roomImage = group.room.roomImage;
      angular.copy(group, service.group);
    }

    function clear() {
      service.group = {
        name: '',
        members: [],
        isPrivate: false,
        topic: 'social'
      };
    }

    function open() {
      // $mdDialog.show({
      //   templateUrl: 'assets/views/adbGroupModal.html',
      //   clickOutsideToClose: true,
      //   fullscreen: true
      // });
    }


    function getRooms() {
      var result = _.map(service.groups, function(item) {
        return item.room;
      });
    }

    function acceptInvitation(params) {
      var deferred = $q.defer();

      $http.post(BaseApiUrl + '/group/accept/' + params.room)
        .success(function(data) {
          deferred.resolve(data);
          service.groups.push(data);
          ConversationsService.push(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

  }
})();
