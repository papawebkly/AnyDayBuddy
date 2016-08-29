(function() {
  'use strict';

  angular
    .module('adbionic')
    .service('ConversationsService', ConversationsService);

  ConversationsService.$inject = ['BaseApiUrl',
    'LocalService',
    'SocketService',
    '$rootScope',
    '$q',
    '$http'
  ];

  function ConversationsService(BaseApiUrl, LocalService, SocketService, $rootScope, $q, $http) {
    var service = {
      conversations: [],
      fromProfile: null,

      init: init,
      getbySocket: getbySocket,
      postBySocket: postBySocket,
      create: createConversation,
      get: get,
      push: push,
      find: find,
      state: state,
      remove: remove,
      archive: archive,
      clear: clear,
      hide: hide,
      changeState: changeState,
      destroy: destroy,
      sendMessage: sendMessageBySocket,
      sendEvent: sendEvent,
      updateMessage: updateMessage,
      openChat: openChat,
      messagesPagination: messagesPagination
    };

    return service;


    function init() {
      var promise = service.get();
      return promise.then(function(data) {
        angular.copy(_.map(data.rooms, function(o) {
          o._subscribed = false;
          o._isHide = false;
          return o;
        }), service.conversations);
        console.log('Conversations', service.conversations);
      });
    }

    function getbySocket() {
      var deferred = $q.defer();
      var token = LocalService.get('access_token');
      SocketService.connection.get(BaseApiUrl + '/user/room/' + '?token=' + token, null, function(response) {
        deferred.resolve(response);
      });

      return deferred.promise;
    }

    function postBySocket(guestUser) {
      var deferred = $q.defer();
      var payload = {
        guest: guestUser,
        type: 'chat'
      };
      var token = LocalService.get('access_token');
      SocketService.connection.post(BaseApiUrl + '/room/' + '?token=' + token, payload, function(response) {
        service.conversations.push(response);
        deferred.resolve(response);
      });

      return deferred.promise;
    }

    function get() {
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/user/room/')
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function destroy(params) {
      var deferred = $q.defer();
      var index = service.find(params.id);
      service.conversations.splice(index, 1);
      $http.delete(BaseApiUrl + '/room/' + params.id)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function find(id) {
      var index = _.findIndex(service.conversations, function(o) {
        return o.id === id;
      });

      return index;
    }

    function push(data) {
      var index = service.find(data.id);
      if (index <= 0) {
        console.log(data.id, index);
        data._subscribed = false;
        data._isHide = false;
        service.conversations.push(data);
      }
    }

    function createConversation(guestUser) {
      var deferred = $q.defer();

      var payload = {
        guest: guestUser,
        type: 'chat'
      };
      console.log('creating convo');
      $http.post(BaseApiUrl + '/room/', payload)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
          service.push(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function sendMessage(payload) {
      var deferred = $q.defer();

      $http.post(BaseApiUrl + '/message/', payload)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function sendMessageBySocket(payload) {
      var deferred = $q.defer();
      var token = LocalService.get('access_token');
      SocketService.connection.post(BaseApiUrl + '/message/' + '?token=' + token, payload, function(response) {
        console.log('message sent');
      });
      //return deferred.promise;
    }

    function remove(room) {
      for (var i = service.conversations.length - 1; i >= 0; --i) {
        if (service.conversations[i].id === room) {
          service.conversations.splice(i, 1);
        }
      }
    }

    function hide(room) {
      for (var i = service.conversations.length - 1; i >= 0; --i) {
        if (service.conversations[i].id === room) {
            service.conversations[i]._isHide = true;
            _.remove(service.conversations[i].messages, undefined);
            //service.conversations.splice(i,1);
        }
      }
    }

    function archive(room) {
      for (var i = service.conversations.length - 1; i >= 0; --i) {
        if (service.conversations[i].id === room)
          service.conversations[i].isArchived = true;
          service.conversations[i]._isHide = true;
      }
    }

    function clear(room) {
      for (var i = service.conversations.length - 1; i >= 0; --i) {
        if (service.conversations[i].id === room) {
          service.conversations[i].isClear = true;
          _.remove(service.conversations[i].messages, undefined);
        }
      }
    }


    function state(room, state, value)  {
      var val = value;
      for (var i = service.conversations.length - 1; i >= 0; --i) {
        if (service.conversations[i].id === room) {
          service.conversations[i][state] = val;
        }
      }

    }

    function changeState(id, payload) {
      var deferred = $q.defer();

      $http.put(BaseApiUrl + '/room/' + id + '/state', payload)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
          service[data.action](data.room);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function sendEvent(payload) {
      var deferred = $q.defer();
      var token = LocalService.get('access_token');
      SocketService.connection.post(BaseApiUrl + '/room/event/' + '?token=' + token, payload, function(response) {
        console.log('event sent');
      });
    }

    function updateMessage(messageId) {
      var deferred = $q.defer();

      $http.put(BaseApiUrl + '/message/' + messageId)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function openChat(userId, conversationId) {
      var index = -1;
      var deferred = $q.defer();

      if (conversationId) {
        index = _.findIndex(service.conversations, function(o) {
          return o.id === conversationId;
        });
      } else {
        index = _.findIndex(service.conversations, function(o) {
          return !o.isGroup && (o.creator.id === userId || o.guest.id === userId);
        });
      }
      if (index >= 0) {
        deferred.resolve(service.conversations[index]);
        // $rootScope.$emit('openChat', service.conversations[index], false);
      } else {
        service.postBySocket(userId)
          .then(function(resp) {
            deferred.resolve(resp);
            // $rootScope.$emit('openChat', resp, true);
          }, function(err) {
            deferred.reject(err);
          });
      }

      return deferred.promise;
    }

    function messagesPagination(id, params) {
      var deferred = $q.defer();

        $http.get(BaseApiUrl + '/room/' + id + '/messages/', {
          params: params
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
})();
