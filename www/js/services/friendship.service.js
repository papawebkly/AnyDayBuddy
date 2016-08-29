(function() {
  'use strict';

  angular
    .module('adbionic')
    .factory('FriendshipService', factory);

  factory.$inject = ['BaseApiUrl', '$http', '$q', 'ConversationsService'];

  function factory(BaseApiUrl, $http, $q, ConversationsService) {
    var service = {
      buddies: [],
      mapchips: {
        name: 'fullname',
        image: 'profileImage'
      },
      acceptInvitationToGroup: acceptInvitationToGroup,
      removeLocalByRelationship: removeLocalByRelationship,
      getMyBuddies: getMyBuddies,
      invite: sendInvitation,
      accept: acceptRequest,
      reject: rejectRequest,
      acceptRequest: acceptRequest,
      rejectRequest: rejectRequest,
      changeStatus: changeStatus,
      search: search,
      find: find,
      report: report,
      remove: remove,
      fistBump: fistBump,
      isFriend: isFriend,
    };

    return service;

    function sendInvitation(params) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/buddy/friendship/', params)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }


    function getMyBuddies(params) {
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/user/buddies/', params)
        .success(function(data, status, headers, config) {
          angular.copy(data.list, service.buddies);
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function acceptRequest(params) {
      var deferred = $q.defer();

      $http.post(BaseApiUrl + '/friendship/' + params.id + '/accept')
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
          service.getMyBuddies();
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function rejectRequest(params) {
      var deferred = $q.defer();

      $http.post(BaseApiUrl + '/friendship/' + params.id + '/reject')
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function search(params) {
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/buddy/' + params.buddyNumber)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function report(payload) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/report/', payload)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function remove(buddy, block) {
      var deferred = $q.defer();

      removeLocal(buddy);
      $http.delete(BaseApiUrl + '/friendship/' + buddy._relationship, {
          params: {
            block: block || false
          }
        })
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function fistBump(buddy) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/user/bump/' + buddy.id)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function removeLocal(buddy) {
      for (var i = service.buddies.length - 1; i >= 0; --i) {
        if (service.buddies[i].id == buddy.id)
          service.buddies.splice(i, 1);
      }
    }

    function removeLocalByRelationship(relationship) {
      for (var i = service.buddies.length - 1; i >= 0; --i) {
        if (service.buddies[i]._relationship == relationship)
          service.buddies.splice(i, 1);
      }
    }

    function find(id) {
      var index = _.findIndex(service.buddies, function(o) {
        return o.id == id;
      });

      return index;
    }

    function isFriend(buddyId) {
      for (var i = service.buddies.length - 1; i >= 0; --i) {
        if (service.buddies[i].id == buddyId) return true;
      }
      return false;
    }

    function changeStatus(index, isOnline) {
      var userId = service.buddies[index].id;
      service.buddies[index].isOnline = isOnline;
      if (ConversationsService.conversations.length > 0) {
        var conv = _.findIndex(ConversationsService.conversations, function(o) {
          return !o.isGroup && (o.creator && o.creator.id == userId || o.guest && o.guest.id == userId);
        });
        if (conv >= 0) {
          var convo = ConversationsService.conversations[conv];

          if (convo && convo.creator.id === userId) {
            convo.creator.isOnline = isOnline;
          } else if (convo && convo.guest.id === userId) {
            convo.guest.isOnline = isOnline;
          }
        }

      }
    }

    function acceptInvitationToGroup() {
      console.log('accepting Invitation');
    }
  }
})();
