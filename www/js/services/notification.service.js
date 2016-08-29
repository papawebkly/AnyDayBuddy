(function() {
    'use strict';

    angular
      .module('adbionic')
      .factory('NotificationService', factory);

    factory.$inject = ['_', 'BaseApiUrl', '$http', '$q', 'FriendshipService', 'GroupService', 'ActivityService', 'ParentalService'];

    /* @ngInject */
    function factory(_, BaseApiUrl, $http, $q, FriendshipService, GroupService, ActivityService, ParentalService) {

      var service = {
        get: get,
        config: config,
        saveConfig: saveConfig,
        update: update,
        find: find,
        list: [],
        settings: [],
        acceptInvitation: acceptInvitation,
        acceptInvitationToActivity: acceptInvitationToActivity,
        acceptInvitationToGroup: acceptInvitationToGroup,
        fistBumpBack: fistBumpBack,
        acceptRequestingInvitation: acceptRequestingInvitation,
        acceptParentalControlInvitation: acceptParentalControlInvitation
      };

      return service;

      function get() {
        var deferred = $q.defer();

        $http.get(BaseApiUrl + '/user/notifications/')
          .success(function(data, status, headers, config) {
            deferred.resolve(data);
            if (!data.hasOwnProperty('err')) {
              var notifications = [];
              data.forEach(function(item, index) {
                item._loading = false;
                if (item.action) {
                  notifications.push(item);
                }
              });
              angular.copy(notifications, service.list);
            }
          })
          .error(function(err) {
            setTimeout(function() {
              deferred.reject(err);
            }, 2000);
          });
        return deferred.promise;
      }

      function update(id) {
        var deferred = $q.defer();
        $http.put(BaseApiUrl + '/user/notifications/' + id)
          .success(function(data, status, headers, config) {
            setTimeout(function() {
              deferred.resolve(data);
            }, 2000);
          })
          .error(function(err) {
            setTimeout(function() {
              deferred.reject(err);
            }, 2000);
          });
        return deferred.promise;
      }

      function find(id, identity) {
        var index = _.findIndex(service.list, function(o) {
          return o[identity] == id;
        });

        return index;
      }

      function acceptInvitation(payload, cancel) {
        if (!cancel) {
          return FriendshipService.accept({
            id: payload.relatedRelationship
          });
        } else {
          return FriendshipService.reject({
            id: payload.relatedRelationship
          });
        }
      }

      function acceptRequestingInvitation(payload, cancel) {
        console.log(payload);
        if (!cancel) {
          return ActivityService.acceptRequest({
          activity: payload.relatedActivity,
          user: payload.relatedRequester
        });
      } else {
        return ActivityService.rejectRequest({
            activity: payload.relatedActivity,
            user: payload.relatedRequester
        });
      }
    }

    function acceptInvitationToGroup(payload) {
      console.log(payload);
      return GroupService.acceptInvitation({
        room: payload.relatedRoom
      });
    }

    function acceptInvitationToActivity(payload, cancel) {
      console.log(payload);
      if (!cancel) {
        return ActivityService.acceptInvitation({
          activity: payload.relatedActivity
        });
      } else {
        return ActivityService.rejectInvitation({
          activity: payload.relatedActivity
        });
      }
    }

    function fistBumpBack(payload, cancel) {
      console.log(payload);
      return FriendshipService.fistBump({
        id: payload.sender.id
      });
    }


    function config(payload) {
      var deferred = $q.defer();

      $http.get(BaseApiUrl + '/notifications/', payload)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          setTimeout(function() {
            deferred.reject(err);
          }, 2000);
        });
      return deferred.promise;
    }

    function saveConfig(payload) {
      var deferred = $q.defer();

      $http.put(BaseApiUrl + '/notifications/', payload)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          setTimeout(function() {
            deferred.reject(err);
          }, 2000);
        });
      return deferred.promise;
    }

    function currentNotifications() {
      return [{
        id: 'none',
        name: 'Search coming to an end',
        enabled: false
      }, {
        id: 'activityInvitation',
        name: 'Search invite',
        enabled: false
      }, {
        id: 'groupInvitation',
        name: 'Group invite',
        enabled: false
      }, {
        id: 'friendRequest',
        name: 'New buddy request',
        enabled: false
      }, {
        id: 'fistBump',
        name: 'First bump',
        enabled: false
      }];
    }

    function acceptParentalControlInvitation(payload, cancel) {
      console.log(payload, cancel)
      if (!cancel) {
          return ParentalService.acceptRequest({
          invitation: payload.relatedParentalInvitation
        });
      } else {
        return ParentalService.rejectRequest({
            invitation: payload.relatedParentalInvitation
        });
      }
    }

  }
})();
