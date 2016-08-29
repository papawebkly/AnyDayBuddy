angular.module('adbionic')
.controller('ChatsCtrl', function($scope, $rootScope, $ionicModal, LocalService, GroupService, ConversationsService, FriendshipService) {
	$scope.unread = 0;
    $scope.isOpen = false;
    $scope.groups = GroupService.conversations;
    $scope.conversations = ConversationsService.conversations;
    $rootScope.loading_messages = [];
    console.log('Chats')
    activate();

    ////////////////

    function activate() {
      console.log('service', LocalService.get('fromChat'));
      if (LocalService.get('fromChat')) {
        var buddyId = LocalService.get('fromChat');
        ConversationsService.openChat(buddyId).then(function(resp) {
          LocalService.unset('fromChat');
          $scope.openConversation(resp);
        }); 
      }
    	FriendshipService.getMyBuddies();
    }

    $scope.isFriend = function(buddyId) {
      return FriendshipService.isFriend(buddyId);
    };

    $scope.toggle = function() {
      $scope.isOpen = !$scope.isOpen;
    };

    $scope.openChatOptions = function($event) {
      $event.stopPropagation();
    };

    $scope.openConversation = function(conversation) {
    	$scope.conversation = conversation;
  		$scope.conversation.params =  {
        	limit: 5,
        	page: 1
      	}

      	$rootScope.conversation_isopen = true;
        var id = $scope.conversation.id
      	$rootScope.loading_messages[id] = true;
        ConversationsService.messagesPagination(id, $scope.conversation.params)
        .then(function(resp) {
          	$scope.conversation.messages = resp.messages;
          	if ($scope.conversation._isHide) {
            	$scope.conversations[index]._isHide = false;
          	}
          	var c = $scope.conversation;
          	if (c.hasOwnProperty('messages') && c.messages.length > 0) {
            	c.messages[c.messages.length - 1].status = 'read';
            	ConversationsService.updateMessage(c.messages[c.messages.length - 1].id);
          	} else {
            	c.messages = [];
          	}
      		$rootScope.loading_messages[id] = false;
	      	$ionicModal.fromTemplateUrl('templates/conversations.html', {
		        scope: $scope
		      }).then(function(modal) {
		          $scope.modal_conversation = modal;
		          $scope.modal_conversation.show();
		      });
        });  
    };

    $scope.closeConversation = function() {
    	$scope.modal_conversation.remove();
    }

    $scope.isURL = function(string) {
      var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
      return regex.test(string);
    };


    function computeUnreadMessages(c) {
      var count = 0;

      for (var i = c.length - 1; i >= 0; --i) {
        if (!c[i].hasOwnProperty('messages') || !c[i].messages.length) continue;

        if (c[i].messages[c[i].messages.length - 1].status != 'read' &&
          c[i].messages[c[i].messages.length - 1].creator.id != $rootScope.user.id)
          count++;
      }

      $scope.unread = count;
    }

    // Update unread messages count
    $scope.$watch('conversations', function(current, original) {
      if (!current) return;
      computeUnreadMessages(current);
    }, true);

    // Open conversation from another controller
    $rootScope.$on('openChat', function(event, chatId, waitForDOM) {
      console.log('come from service')
      if (waitForDOM) {
        $timeout(function() {
          $scope.openConversation(chatId);
        }, 200);
      } else {
        $scope.openConversation(chatId);
      }
    });
});