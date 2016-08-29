angular.module('adbionic')
.controller('ConversationsCtrl', function($scope, $rootScope, $timeout, $filter, $ionicPlatform, $cordovaImagePicker,
   ImageUploadFactory, ConversationsService, UtilService, SocketService, ActivityService) {
    $scope.conversations = ConversationsService.conversations;
    $scope.content = '';
    $scope.openMenu = false
    $scope.openShared = false
    $scope.new_search = {
        vibe: true,
        category: 'social',
        activities: [],
        type: 'public',
        participants: [$rootScope.user]
    };
    init();
    ////////////////

   	function init() {
        $scope.conversation.new = {};
        $scope.conversation.collapsed = false;

        if ($scope.conversation.isGroup) {
            $scope.conversation.title = $scope.conversation.name;
        } else if ($scope.conversation.creator.id == $rootScope.user.id) {
            $scope.conversation.title = $scope.conversation.guest.fullname;
            $scope.conversation.buddy = $scope.conversation.guest;
        } else {
            $scope.conversation.title = $scope.conversation.creator.fullname;
            $scope.conversation.buddy = $scope.conversation.creator;
        }
        console.log($scope.conversation.buddy)
    };
    
    $scope.isURL = function(string) {
      var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
      return regex.test(string);
    };

    $scope.toggle = function() {
    	$rootScope.conversation_isopen = false;
  		$scope.conversation.collapsed = !$scope.conversation.collapsed;

      	if (!$scope.conversation.collapsed && $scope.conversation.messages.length > 0) {
        	$scope.conversation.messages[$scope.conversation.messages.length - 1].status = 'read';
        	ConversationsService.updateMessage(
          		$scope.conversation.messages[$scope.conversation.messages.length - 1].id
        	);
      	}
    };

    $scope.addToBuddies = function(buddy) {
        console.log('addToBuddies', buddy);

        // type: 1 for map, 0 for buddyNumber
        FriendshipService.invite({ userId: buddy.id, type: 1 })
        .then(function(resp) {
          console.log(resp);
          UtilService.showToast('Invitation sent');
        }, function(err) {
          console.log(err);
        });
    };

    $scope.attach = function() {
      console.log('selecting image');
      // Image picker will load images according to these settings
      var options = {
        maximumImagesCount: 1, // Max number of selected images, I'm using only one for this example
        width: 800,
        height: 800,
        quality: 80 // Higher is better
      };

      $ionicPlatform.ready(function() {
        $cordovaImagePicker.getPictures(options).then(function(results) {
          if (results.length > 0) {
            ImageUploadFactory.uploadImage(results[0]).then(function(resp) {
              console.log(resp)
              $scope.content = resp.url;
              $scope.send();
            })
          }

        }, function(error) {
          console.log('Error: ' + JSON.stringify(error)); // In case of error
        });
      });
    }

    $scope.checkActivity = function(message) {
     activateActivity(message)
    }

    function activateActivity(message) {
      $scope.loading = true;
      $scope.activityId = getId(message);
      ActivityService.getDetail($scope.activityId)
        .then(function(resp) {
          $scope.activity = resp.activity;
          $scope.activity.participants = resp.participants;
          $scope.loading = false;
          formatParticipants();
        });
    }

    $scope.openSearch = function() {
      openSearch($scope.activity);
    };

    function getId(message) {
      var split = message.split('[search:');
      return split[split.length - 1].slice(0, -1);
    }

    function formatParticipants() {
      for (var i = $scope.activity.participants.length - 1; i >= 0; i--) {
        var participant = $scope.activity.participants[i];
        $scope.activity.participants[i].fullname = participant.user ? participant.user.fullname : '';
        $scope.activity.participants[i].profileImage = participant.user ? participant.user.profileImage : '';
        $scope.activity.status = $scope.activity.participants[i].status;

        if (participant.user && (participant.user.id == $rootScope.user.id) &&
          $scope.activity.participants[i].status == 'requested') {
          $scope.showInvitation = true;
        } else {
          $scope.showInvitation = false;
        }
      }
    }
    
    $scope.send = function() {

        if (!$scope.content) return;
        $timeout(function() {
            $scope.conversation.writing = false;

            var payload = {
              messageIdFromClient: UtilService.uid(10),
              content: $scope.content,
              creator: $rootScope.user.id,
              conversation: $scope.conversation.id
            };

            var index = ConversationsService.find($scope.conversation.id);

            ConversationsService.conversations[index].messages.push({
              createdAt: moment().format(),
              content: $scope.content,
              creator: {
                profileImage: $rootScope.user.profileImage,
                fullname: $rootScope.user.fullname,
                id: $rootScope.user.id
              },
              messageIdFromClient: payload.messageIdFromClient,
              status: 'read'
            });

            ConversationsService.sendMessage(payload);

            clearText($scope.conversation);
            // updateScroll($scope.conversation);
        }, 0);
    };

    $scope.sendEvent = function(conversation) {
        ConversationsService.sendEvent({
            room: $scope.conversation.id,
            user: $rootScope.user.username
        });
    };

    function clearText(conversation) {
        angular.copy({}, $scope.conversation.new);
        $scope.content = '';
    }

    $rootScope.$on('handshake', function(event, activity) {
        $rootScope.$emit('sendMessage', $scope.conversation, '[search:' + activity.id + ']');
    });

    $scope.$watchCollection('conversations', function(current, o) {
        if (!current || current.length === 0) return;

         _.map(current, function(item) {
        if (!item._subscribed && !item.isGroup) {
            item._subscribed = true;
            item.tab = 0;
            SocketService.subscribe('/room/' + item.id + '/subscribe/');
        }
      });
    });

    $rootScope.$on('sendMessage', function(event, conversation, content) {
        console.log($scope.conversation, content);
        $scope.content = content;
        $scope.send();
    });


    $scope.$watchCollection('conversation.messages', function(current, original) {
      if (!current) return;

      $scope.images = _.filter(current, function(o) {
        if ($scope.isURL(o.content)) return o;
      });

      $scope.images = _.reverse($scope.images);
      console.log($scope.images)
      $scope.images = _.groupBy($scope.images, function(o) {
        return moment(moment(o.createdAt).startOf('day')).format();
      });
    });


    SocketService.connection.on('room', function(message) {
        $scope.$apply(function() {
        switch (true) {
          case message.verb === 'messaged':
            switch (true) {
              case message.data.model === 'message':
                var m = message.data.payload;
                console.log(m);
                var conversation = _.find(ConversationsService.conversations, function(obj) {
                  return obj.id === m.conversation;
                });

                console.log(conversation);
                
                if(conversation._isHide) {
                 conversation._isHide = false;
                }

                var messageExists = _.findIndex(conversation.messages, function(obj) {
                  return obj.messageIdFromClient === m.messageIdFromClient;
                });
                console.log(messageExists);

                var conversationIndex = _.findIndex(ConversationsService.conversations, function(obj) {
                  return obj.id === m.conversation;
                });

                console.log(conversationIndex);

                if (conversationIndex >= 0) {
                  m.status = 'read';
                }

                if (messageExists < 0) {
                  $scope.conversation.messages.push(m);
                  // updateScroll($scope.conversation);
                }
                break;

              case message.data.model === 'room':
                //ConversationsService.push(message.data.payload);
                break;

              case message.data.model === 'event':
                console.log(message);
                break;

              default:
                console.log(message);
            }

            break;
            default:
                console.log(message);
        }
      });
    });
});