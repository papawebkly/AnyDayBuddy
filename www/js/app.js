if (window.cordova) {
  window.cordova.addStickyDocumentEventHandler('handleopenurl');
}

function handleOpenURL(url) {
  window.cordova.fireDocumentEvent('handleopenurl', { url: url });
}

if (window.io) {
	window.io.sails.autoConnect = false;
}
// angular.module('adbionic', ['ionic', 'ngCordova']);
angular.module('adbionic', ['ionic', 'ngCordova', 'uiGmapgoogle-maps', 'satellizer']);
angular.module('adbionic')
  .constant('BaseApiUrl', 'http://159.203.47.252:1339')
  .constant('version', '1')
  .constant('_', window._)
  .constant('moment', window.moment)
  .constant('io', window.io);
angular.module('adbionic')

.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'AppCtrl',
    authenticate: false
  })
  .state('app.dashboard', {
    url: '/dashboard',
    views: {
      'dashboard': {
        templateUrl: 'templates/dashboard.html',
        controller: 'DashboardCtrl'
      }
    },
    authenticate: true
  })
  .state('app.buddies', {
    url: '/buddies',
    views: {
      'buddies': {
        templateUrl: 'templates/buddies.html',
        controller: 'BuddiesCtrl'
      }
    },
    authenticate: true
  })
  .state('app.search', {
    url: '/search',
    views: {
      'search': {
        templateUrl: 'templates/search.html',
        controller: 'SearchCtrl'
      }
    },
    authenticate: true
  })
  .state('app.notifications', {
    url: '/notifications',
    views: {
      'notifications': {
        templateUrl: 'templates/notifications.html',
        controller: 'NotificationsCtrl'
      }
    },
    authenticate: true
  })

  .state('app.chats', {
    url: '/chats',
    views: {
      'chats': {
        templateUrl: 'templates/chats.html',
        controller: 'ChatsCtrl'
      }
    },
    authenticate: true
  })

  
  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl',
    authenticate: false
  })
  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SignUpCtrl',
    authenticate: false
  })
  .state('completesignup', {
    url: '/completesignup',
    templateUrl: 'templates/completesignup.html',
    controller: 'SignUpCtrl',
    authenticate: true
  })
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl',
    authenticate: false
  });

  $urlRouterProvider.otherwise('/home');
}]);
angular.module('adbionic')

.run(["$rootScope", "$ionicPlatform", "$cordovaKeyboard", "$cordovaStatusbar", "$state", "$ionicHistory", "LocalService", "Auth", "SocketService", function($rootScope, $ionicPlatform, $cordovaKeyboard, $cordovaStatusbar, $state, $ionicHistory, LocalService, Auth, SocketService) {

    $ionicPlatform.ready(function() {
        if (!window.cordova) return;
        $cordovaKeyboard.hideAccessoryBar(true);
        $cordovaKeyboard.disableScroll(true);
        $cordovaStatusbar.style(0);
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState) {
        var authStates = ['login', 'resetPassword'];
        $rootScope.currentState = toState.name;
        $rootScope.isAuthenticated = Auth.isAuthenticated();
        $rootScope.modal_tutorial = null;
        if (Auth.isAuthenticated()) {
            $rootScope.isAuthenticated = true;
            $rootScope.user = JSON.parse(LocalService.get('user'));
        }

        if (toState.name == 'validate' && Auth.isAuthenticated()) {
            $rootScope.view = 'main';
            return;
        }

        if (toState.name == 'validate' && !Auth.isAuthenticated()) {
            $rootScope.view = 'auth';
            return;
        }

          /**
           * if the state does not requires authentication and the
           * user is logged in, redirect to the dashboard page.
           */
        if (!toState.authenticate && Auth.isAuthenticated() && $rootScope.user.completedSignup) {
            console.log('authenticated');
            event.preventDefault();
            $state.transitionTo('app.dashboard');
            $rootScope.currentState = 'app.dashboard';
        }

          /**
           * if the state requires authentication and the
           * user is not logged in, redirect to the login page.
           */
        if (toState.authenticate && !Auth.isAuthenticated()) {
            console.log('not auth');
            event.preventDefault();
            LocalService.unset('user');
            $state.transitionTo('login');
            $rootScope.currentState = 'login';
        }

        $rootScope.view = authStates.indexOf($rootScope.currentState) >= 0 ? 'auth' : 'main';
  });
}])
angular.module('adbionic')
	.config(mapsProvider)
	.config(authProvider)

	mapsProvider.$inject = ['uiGmapGoogleMapApiProvider'];

	function mapsProvider(uiGmapGoogleMapApiProvider) {
	    uiGmapGoogleMapApiProvider.configure({
	      key: 'AIzaSyAwK51ikb7PENrz_eEBJ8mC1hwxsLWbDDQ',
	      libraries: 'places'
	    });
	}
	 
	authProvider.$inject = ['$authProvider', '$httpProvider'];

  	function authProvider($authProvider, $httpProvider) {
	    //Satellizer Settings
	    $authProvider.authHeader = 'Authorization';
	    $authProvider.authToken = 'Bearer';
	    $authProvider.token = 'token';
	    $authProvider.tokenPrefix = 'access';
	    $authProvider.storageType = 'localStorage';

	    $authProvider.facebook({
	      clientId: '1665816233706214',
	      name: 'facebook',
	      url: 'http://159.203.47.252:1339/auth/facebook',
	      authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth',
	      redirectUri: window.location.origin + '/',
	      requiredUrlParams: ['display', 'scope'],
	      scope: ['email'],
	      scopeDelimiter: ',',
	      display: 'popup',
	      type: '2.0',
	      popupOptions: {
	        width: 580,
	        height: 400
	      }
	    });

	    // Google
	    $authProvider.google({
	      url: 'http://159.203.47.252:1339/auth/google',
	      clientId: '1081734392317-3gh14vephi624rc7esoikas0p9coeukj.apps.googleusercontent.com',
	      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
	      redirectUri: window.location.origin,
	      requiredUrlParams: ['scope'],
	      optionalUrlParams: ['display'],
	      scope: ['profile', 'email'],
	      scopePrefix: 'openid',
	      scopeDelimiter: ' ',
	      display: 'popup',
	      type: '2.0',
	      popupOptions: {
	        width: 452,
	        height: 633
	      }
	    });

	    $httpProvider.interceptors.push('interceptorsService');
  	}

// 	.config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
//   GoogleMapApi.configure({
//     v: '3.17',
//     libraries: 'weather,geometry,visualization'
//   });
// }]);
// .config(function($httpProvider) {
//   $httpProvider.interceptors.push('authInterceptor');
//   $httpProvider.defaults.withCredentials = true;
// });

angular.module('adbionic')

.controller('AppCtrl', ["$scope", "$state", "$rootScope", "$ionicModal", "$ionicPlatform", "$timeout", "$ionicPopover", "SocketService", "Auth", "UtilService", "NotificationService", "ActivityService", "ConversationsService", "FriendshipService", "UserService", function($scope, $state, $rootScope, $ionicModal, $ionicPlatform, $timeout, $ionicPopover,
  SocketService, Auth, UtilService, NotificationService,
  ActivityService, ConversationsService, FriendshipService, UserService) {
  console.log('App');
  $scope.buddies = FriendshipService.buddies;
  $scope.notifications = NotificationService.list;
  $scope.conversations = ConversationsService.conversations;
  $scope.activity = {};
  $scope.step = 1;
  $scope.filter = '';
  $scope.config = {};
  var format = 'DD/MM/YYYY hh:mm a';
  var start = "#datetimepicker-start";
  var end = "#datetimepicker-end";
  $scope.data = {};
  $scope.selected_buddy = {};
  $scope.selected_group = {};
  $scope.new_members = [];
  $scope.default_avatar = UtilService.defaultAvatar;
  activate();

  //////

  function activate() {
    $scope.user = $rootScope.user;
    SocketService.init();
    NotificationService.get().then(function(res) {}, function(err) {
      console.log(err);
    });

    UtilService.getBadWords();
    SocketService.connection.on('user', function(message) {
      var verb = message.data.verb;
      var model = message.data.model;
      var payload = message.data.payload;
      console.log(model, payload);
      $scope.$apply(function() {
        switch (true) {
          case model === 'notification':
            if (payload.isInvitation) {
              NotificationService.list.push(payload);
            }
            if (!payload.action && (typeof $scope[payload.handler] === 'function')) {
              $scope[payload.handler]();
            }

            if (payload.type === 'RelationshipCreatedAndAccepted') {
              ConversationsService.state(payload.relatedRoom, 'isDisabled', false);
              ConversationsService.state(payload.relatedRoom, '_isHide', false);
            }
            break;
          case model === 'room':
            ConversationsService.push(payload);
            break;
          case model === 'user':
            var index = FriendshipService.find(payload.id);
            if (index >= 0) {
              FriendshipService.changeStatus(index, payload.isOnline);
            }
            break;
          case model === 'relationship':
            FriendshipService.removeLocalByRelationship(payload.relationship);
            if (payload.room) {
              ConversationsService.state(payload.room, 'isDisabled', true);
            }
            break;
          default:
            console.log(message.data);
        }
      });
    });

    getMyBuddies();

    $scope.resendVerification = function() {
      $scope.loadingVerification = true;
      UserService.resendVerification().then(function(resp) {
        $scope.loadingVerification = false;
      });
    };

    // if (!$scope.startDate) $scope.startDate = moment().format(format);
    // if (!$scope.endDate) $scope.endDate = moment().add(1, 'hour').format(format);
    // if ($scope.endDate == -1)  $scope.endDate = 'Until Further Notice';

    ConversationsService.init().finally(function() {
      $scope.loading = false;
    })
  }

  // Update unread messages count
  $scope.$watch('conversations', function(current, original) {
    if (!current) return;
    computeUnreadMessages(current);
  }, true);

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

  $scope.logout = function() {
    console.log('LogOut');
    $scope.popover.hide();
    SocketService.request('GET', '/user/unsubscribe/', null, function(res, jwres) {
      SocketService.connection.disconnect();
      SocketService.subscribed = false;
      Auth.logout();
    });
  };

  $scope.dashboard = function() {
    $state.go('dashboard', {}, { reload: true })
  }

  // Profile Settings Modal

  $scope.openModalSettings = function() {
    $ionicModal.fromTemplateUrl('templates/modal/profileSettings.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal_settings = modal;
      $scope.popover.hide();
      $scope.modal_settings.show();
    });
  }

  $scope.hideModalSettings = function() {
    $scope.modal_settings.remove();
  }


  $scope.openModalSearch = function(activity) {
    //Search Detail Modal
    $ionicModal.fromTemplateUrl('templates/modal/searchDetail.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal_search = modal;
      $scope.activity = angular.copy(activity);
      $scope.participants = angular.copy(activity.participants);
      $scope.modal_search.show();
    });
  }

  $scope.hideModalSearch = function() {
    $scope.activity = {};
    $scope.participants = [];
    $scope.buddies.map(function(element) {
      delete element.invited;
    })
    $scope.modal_search.remove();
  }

  $scope.openModalNewSearch = function(new_search, chat) {
    //New Search Modal
    $ionicModal.fromTemplateUrl('templates/modal/newSearch.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal_newsearch = modal;
      $scope.isFromChat = !!chat;
      getCategories("all");
      // getMyBuddies();
      if (new_search) {
        $scope.new_search = angular.copy(new_search);
      }
      $scope.modal_newsearch.show();
    });

  }

  $scope.hideModalNewSearch = function() {
    $scope.step = 1;
    $scope.new_search = {
      vibe: true,
      category: 'social',
      activities: [],
      type: 'public',
      participants: []
    };
    $scope.modal_newsearch.remove();
  }

  $scope.openSearchFindModal = function(action, placeholder, new_search) {
    // Modal Select What, Where, When
    $ionicModal.fromTemplateUrl('templates/modal/searchModal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal_findsearch = modal;
      $scope.new_search = new_search;
      $scope.config.action = action;
      $scope.config.placeholder = placeholder;
      if (action == 'When') {
        $scope.modal_findsearch.show();

        var options = {
          format: format,
          inline: true,
          sideBySide: true,
          icons: {
            up: "ion-chevron-up",
            down: "ion-chevron-down",
            previous: "ion-chevron-left",
            next: "ion-chevron-right"
          }
        }
        if (!$scope.startDate) $scope.startDate = moment().format(format);
        if (!$scope.endDate) $scope.endDate = moment().add(1, 'hour').format(format);
        if ($scope.endDate == -1) $scope.endDate = 'Until Further Notice';

        $(start).datetimepicker(options);
        $(end).datetimepicker(options);

        $(start).on("dp.change", function(e) {
          $scope.$apply(function() {
            var startDate = $(start).data("DateTimePicker").date();
            var endDate = $(end).data("DateTimePicker").date();
            $scope.startDate = $(start).data("DateTimePicker").date().format(format);
            if (endDate.isBefore(startDate)) {
              $scope.endDate = startDate.format(format);
              $(end).data("DateTimePicker").date(startDate);
            }
          })
        });

        $(end).on("dp.change", function(e) {
          var endDate = $(end).data("DateTimePicker").date();
          var startDate = $(start).data("DateTimePicker").date();
          if (endDate.isBefore(startDate)) {
            $scope.endDate = startDate.format(format);
            $(end).data("DateTimePicker").date(startDate);
          } else {
            $scope.endDate = $(end).data("DateTimePicker").date().format(format);
          }
        });

        // $(start).on("dp.hide", function (e) {
        //    $(start).data("DateTimePicker").show();
        // });

        // $(end).on("dp.hide", function (e) {
        //    $(end).data("DateTimePicker").show();
        // });
      }
    });



  }

  $scope.okSearchFindModal = function() {
    $scope.modal_findsearch.remove();
  }

  // Popover profile
  $ionicPopover.fromTemplateUrl('templates/modal/popoverProfile.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  }

  $scope.openModalProfile = function(buddy, logged) {
    // Buddy/Group Profile
    $ionicModal.fromTemplateUrl('templates/modal/buddyProfile.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal_profile = modal;
      $scope.popover.hide();
      $scope.logged = !!logged;
      if (buddy) {
        $scope.selected_buddy = angular.copy(buddy);
        loadBuddies($scope.selected_buddy.id);
        loadActivities($scope.selected_buddy.id);
        $scope.new = false;
      } else {
        $scope.new = true;
      }
      $scope.modal_profile.show();
    });
  }

  $scope.hideModalProfile = function() {
    $scope.selected_buddy = {};
    $scope.modal_profile.remove();
  }

  $scope.openModalGroup = function(group) {
    $ionicModal.fromTemplateUrl('templates/modal/groupProfile.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal_group = modal;
      if (group) {
        $scope.selected_group = angular.copy(group);
        $scope.selected_group.creator = group.room.creator.id == $rootScope.user.id;
        $scope.new_members = angular.copy($scope.selected_group.members);
        $scope.new_group = false;
      } else {
        $scope.new_group = true;
      }
      $scope.modal_group.show();
    });
  }

  $scope.hideModalGroup = function() {
    $scope.selected_group = {};
    $scope.modal_group.remove();
  }

  $rootScope.$on('categoryChanged', function(event, args) {
    getCategories(args.category);
  });


  // Vibe Modal
  $scope.openModalVibe = function() {
    $ionicModal.fromTemplateUrl('templates/modal/vibeModal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal_vibe = modal;
      $scope.modal_vibe.show();
    });
  }

  $scope.removeModalVibe = function() {
    $scope.modal_vibe.remove();
  }

  //view Dashboard
  $scope.openDashboard = function(){
    console.log("app dashboard");
    event.preventDefault();
    $state.transitionTo('app.dashboard');
    $rootScope.currentState = 'app.dashboard';
    //$state.go('dashboard', {}, {reload:true});
  }

  //Events Modal
  $scope.openModalEvents = function() {
    $ionicModal.fromTemplateUrl('templates/modal/eventsModal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal_events = modal;
      $scope.modal_events.show();
    });
  }

  $scope.removeModalEvents = function() {
    $scope.modal_events.remove();
  }

  ////// 
  function getCategories(category) {
    $scope.loadingCategories = true;
    ActivityService.getCategories(category).then(function(resp) {
      $scope.categories = resp.subcategories;
    }).finally(function() {
      $scope.loadingCategories = false;
    });
  }

  function getMyBuddies() {
    $scope.loading_buddies = true;
    FriendshipService.getMyBuddies()
      .finally(function() {
        $scope.loading_buddies = false;
      });
  }

  function loadBuddies(userId) {
    UserService.buddies(userId)
      .then(function(resp) {
        $scope.selected_buddy.friends = resp;
      });
  }

  function loadActivities(userId) {
    $scope.loading_activities = true;
    UserService.activities(userId)
      .then(function(resp) {
        $scope.selected_buddy.activities = resp;
      }).finally(function() {
        $scope.loading_activities = false;
      });
  }

}]);

angular.module('adbionic')

.controller('BuddiesCtrl', ["$scope", "$state", "$rootScope", "$ionicModal", "GroupService", "UserService", "FriendshipService", function($scope, $state, $rootScope, $ionicModal, GroupService, 
  UserService, FriendshipService) {
	  console.log('Buddies');
    $scope.loading_buddies = false;
    $scope.loading_groups = true;
    $scope.userView = false;
    $scope.buddies = FriendshipService.buddies;
    $scope.new_buddy = {
      loading: false
    };    
    $scope.new_group = {
      loading: false
    };
    $scope.user = {};

    activate();

    ////////////////

    function activate() {
      if ($scope.adbBuddies) {
        $scope.buddies = $scope.adbBuddies.friends;
        $scope.userView = true;
        return;
      }

      if (!$scope.buddies.length) getMyBuddies();

      if ($rootScope.user && $rootScope.user.birth) {
        var birthday = moment($rootScope.user.birth);
        $scope.user.hasParental = moment().diff(birthday, 'year') >= 18 ? true : false;
      }

      GroupService.init().then(function() {
        $scope.groups = GroupService.groups;
        for (var i = 0; i < $scope.groups.length; i++) {
          for (var id in $scope.groups[i].members) {
            $scope.groups[i].status = $scope.groups[i].members[id].status;
          }
        }
        console.log($scope.groups)
        $scope.loading_groups = false;
      });
    }

  $scope.accept = function(item, relationship) {
    $scope.new_buddy.loading = true;
    $scope.new_buddy.loadingText = 'Accepting invitation...';
    FriendshipService.accept({
        id: relationship
      })
      .then(function(resp) {
        $scope.new_buddy.message = 'Congralutations! You are buddies now, start a chat message with your new buddy';
        $scope.new_buddy.finished = true;
      })
      .finally(function() {
        getMyBuddies();
      });
  };

  function getMyBuddies() {
    $scope.loading_buddies = true;
    FriendshipService.getMyBuddies()
      .finally(function() {
        $scope.loading_buddies = false;
      });
  }

}]);
angular.module('adbionic')
.controller('BuddyProfileCtrl', ["$scope", "$rootScope", "$state", "LocalService", "FriendshipService", "ConversationsService", function($scope, $rootScope, $state, LocalService, FriendshipService, ConversationsService) {

	$scope.new_buddy = {};

    $scope.openChat = function(buddyId, hide) {
    	$scope.hideModalProfile();
    	LocalService.set('fromChat', buddyId);
    	$state.go('app.chats', {}, {reload: true});
    };

	//Add Buddy
  	$scope.invite = function() {
	    $scope.loading = true;
	    $scope.loadingText = 'Sending invitation...';

	    // type: 1 for map, 0 for buddyNumber
	    FriendshipService.invite({ userId: $scope.selected_buddy.id, type: 0 })
	      .then(function(resp) {
	        $scope.message = 'Invitation sent';
	        $scope.hideModalProfile();
	      }, function(err) {
	        console.log(err);
	      })
	      .finally(function() {
	        $scope.loading = false;
	      });
  	};

    $scope.bistClick = function(buddyid){
        $scope.loading = true;

        FriendshipService.fistBump($scope.selected_buddy)
            .then(function(resp) {
                  console.log(resp);
                  $scope.selected_buddy.fistBumps = resp.count;
            }, function(err) {
            console.log(err);
        })
        .finally(function() {
            $scope.loading = false;
        });
    }
  //Block Buddy
  	$scope.blockBuddy = function() {
	    FriendshipService.remove($scope.selected_buddy, true).finally(function() {
	      $scope.selected_buddy = {};
	      $scope.hideModalProfile();
	    });
  	}

  //Remove Buddy
  	$scope.unbuddy = function() {
	    FriendshipService.remove($scope.selected_buddy, false).finally(function() {
	      $scope.selected_buddy = {};
	      $scope.hideModalProfile();
	    });
  	}

  //Search Buddy
  	$scope.searchBuddy = function() {
	    $scope.loading = true;
	    $scope.message = null;
	    $scope.loadingText = 'Searching...';
	    FriendshipService.search({ buddyNumber: $scope.new_buddy.buddyNumber })
	      .then(function(resp) {
	        if (resp.friendshipData.isMyBuddy) {
	          $scope.message = resp.user.fullname + ' is already your buddy!';
	        } else if (resp.friendshipData.requestAlreadySent) {
	          $scope.selected_buddy  = angular.copy(resp.user);
	          $scope.message = 'Waiting for Buddyship';
	        } else {
	          if (resp.notFound) {
	            $scope.selected_buddy = angular.copy(resp.notFound.relatedUser);
	            $scope.canInvite = true
	          } else {
	            $scope.selected_buddy = angular.copy(resp.user);
	            $scope.canInvite = true
	          }
	        }
			$scope.new = false;

	      })
	      .finally(function() {
                   console.log("SSSSSSSSSSSSS");
                   console.log($scope.selected_buddy);
	        $scope.loading = false;
	      });
  	};
}])
angular.module('adbionic')

.controller('ChatsCtrl', ["$scope", "$rootScope", "$ionicModal", "LocalService", "GroupService", "ConversationsService", "FriendshipService", function($scope, $rootScope, $ionicModal, LocalService, GroupService, ConversationsService, FriendshipService) {
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

    $scope.chatDelete = function(room){
                          console.log($scope.conversations);
        for (var i = $scope.conversations.length - 1; i >= 0; --i) {
                          console.log($scope.conversations[i].id);
                          console.log(room);
                if ($scope.conversations[i].id === room) {
                        $scope.conversations.splice(i, 1);
                }
        }
    };
                          
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
}]);
angular.module('adbionic')
.service("$focusTest", function(){
         
         this.focusOnBlur = true;
         
         this.setFocusOnBlur = function(val){
            this.focusOnBlur = val;
         }
         
         this.getFocusOnBlur = function(){
            return this.focusOnBlur;
         }
})

.directive("detectFocus", function ($focusTest) {
           return {
            restrict: "A",
            scope: {
                onFocus: '&onFocus',
                onBlur: '&onBlur',
           },
           link: function (scope, elem) {
           
           elem.on("focus", function () {
                   scope.onFocus();
                   $focusTest.setFocusOnBlur(true);
            });
           
           elem.on("blur", function () {
                   scope.onBlur();
                   if ($focusTest.getFocusOnBlur())
                   elem[0].focus();
                   });
           }
           }
})

.controller('ConversationsCtrl', ["$scope", "$rootScope", "$timeout", "$filter", "$ionicPlatform", "$cordovaImagePicker", "ImageUploadFactory", "ConversationsService", "UtilService", "SocketService", "ActivityService","$focusTest","$ionicScrollDelegate","$ionicModal", function($scope, $rootScope, $timeout, $filter, $ionicPlatform, $cordovaImagePicker,
   ImageUploadFactory, ConversationsService, UtilService, SocketService, ActivityService, $focusTest, $ionicScrollDelegate,$ionicModal) {
    $scope.conversations = ConversationsService.conversations;
    $scope.content = '';
    $scope.pageCount= 1;
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
    
    $scope.shouldNotFocusOnBlur = function() {
        $focusTest.setFocusOnBlur(false);
        $ionicScrollDelegate.$getByHandle('conversationScroll').scrollBottom();
    };
                                  
    $scope.showModalImage = function(image){
        $ionicModal.fromTemplateUrl('templates/modal/chatImage.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.chatImage = image;
            $scope.modal_chatimage = modal;
            $scope.modal_chatimage.show();
        });
        
    };
                                  
    $scope.hideModalImage = function(){
        $scope.modal_chatimage.remove();
             
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
            $ionicScrollDelegate.$getByHandle('conversationScroll').scrollBottom();
            // updateScroll($scope.conversation);
        }, 0);
    };

    $scope.loadMoreData = function() {
        $scope.pageCount++;
                                  
        console.log($scope.pageCount);
        $scope.conversation.params =  {
            limit: 5,
            page: $scope.pageCount
        }
                                  
        $rootScope.conversation_isopen = true;
        var id = $scope.conversation.id
        $rootScope.loading_messages[id] = true;
        ConversationsService.messagesPagination(id, $scope.conversation.params)
        .then(function(resp) {
              for(i=resp.messages.length-1; i>=0; i--)
              {
                var item = resp.messages[i];
                $scope.conversation.messages.splice(0, 0, item);
              }
        })
        $scope.$broadcast('scroll.refreshComplete');
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
}]);
angular.module('adbionic')

.controller('DashboardCtrl', ["$scope", "$state", "$rootScope", "UserService", "ActivityService", "FriendshipService", "GroupService","$ionicSlideBoxDelegate","$ionicModal","LocalService","$timeout", function($scope, $state, $rootScope, UserService, ActivityService, FriendshipService, GroupService, $ionicSlideBoxDelegate, $ionicModal, LocalService, $timeout) {
	console.log('Dashboard');
    $scope.loading_buddies = false;
    $scope.loading_groups = true;
    $scope.buddies = FriendshipService.buddies;
    $scope.invites = ActivityService.invites;
    $scope.activities = ActivityService.searches;
    $scope.new_search = {
        vibe: true,
        category: 'social',
        activities: [],
        type: 'public',
        participants: []
    };

    activate();
    
                              
    function activate() {
        $scope.user = $rootScope.user;
        $rootScope.$broadcast('categoryChanged', {category: $scope.new_search.category});

        if (!$scope.user.completedSignup) {
    	   $state.go('completesignup', {}, {reload:true});
        }
        else
        {
            var registeredTutorial = LocalService.get('isRegisteredTutorial');
            $timeout(function() {
                if(registeredTutorial != "yes")
                {
                    LocalService.set('isRegisteredTutorial', "yes");
                    openModalTutorial();
                     console.log('Opened!');
                }
            }, 500);
        }

        UserService.resume()
            .then(function(resp) {
                _.map(resp, function(obj, key) {
                $rootScope.user[key] = obj.count;
            });
        });

        // Upcoming Events
        $scope.loading_events = true;
        ActivityService.getEvents({
            initDate: moment().startOf('day'),
            endDate: moment().endOf('day')
        })
        .then(function(resp) {
          //activities - categories
            $scope.today_events = [];
            if (resp.activities.length == 0) {
                $scope.loading_events = false;
            }
            $scope.events = resp.activities;
            var categories = resp.categories;
            for (var i = 0; i < $scope.events.length; i++) {
                if ($scope.events[i].date == moment().format('YYYY-M-DD')) {
                    $scope.today_events = angular.copy($scope.events[i].events);
                    break;
                }
            }
            for (var i = 0; i < $scope.today_events.length; i++) {
                $scope.today_events[i].name = categories[$scope.today_events[i].name];
            }
            $scope.loading_events = false;
        });

        if ($scope.adbBuddies) {
            $scope.buddies = $scope.adbBuddies.friends;
            $scope.userView = true;
            return;
        }

        if (!$scope.buddies.length) getMyBuddies();

        GroupService.init().then(function() {
            $scope.groups = GroupService.groups;
            for (var i = 0; i < $scope.groups.length; i++) {
                for (var id in $scope.groups[i].members) {
                    $scope.groups[i].status = $scope.groups[i].members[id].status
                }
            }
            $rootScope.user.groups = $scope.groups;
            $scope.loading_groups = false;
        });

        $scope.loading_search = true;

        if ($scope.adbSearches) {
            $scope.activities = $scope.adbSearches.activities;
            $scope.userView = true;
            $scope.loading_search = false;
            return;
        }

        if (!$scope.activities.length) {
            ActivityService.getSearches({}).then(function(resp) {
                $scope.loading_search = false;
            });
        } else {
            $scope.loading_search = false;
        }

        if (!$scope.invites.length)
            ActivityService.getSearchesInvited();
    }

    function getMyBuddies() {
        $scope.loading_buddies = true;
        FriendshipService.getMyBuddies()
          .finally(function() {
            $scope.loading_buddies = false;
          });
    }

    $scope.selectCategory = function(category) {
        $scope.new_search.category = category;
        $rootScope.$broadcast('categoryChanged', {category: category});
    }

    function openModalTutorial(){
        // Buddy/Group Profile
        $ionicModal.fromTemplateUrl('templates/modal/tutorial.html', {
          scope: $scope
        }).then(function(modal) {
          $scope.modal_tutorial = modal;
          $rootScope.modal_tutorial = $scope.modal_tutorial;
          $scope.modal_tutorial.show();
        });
      }

      $scope.hideModalTutorial = function() {
        $scope.modal_tutorial.remove();
      }

    $scope.startApp = function() {
      //$state.go('main');
    };
    $scope.next = function() {
      $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function() {
      $ionicSlideBoxDelegate.previous();
    };

    // Called each time the slide changes
    $scope.slideChanged = function(index) {
      $scope.slideIndex = index;
    };

  // function getCategories() {
  //   $scope.loadingCategories = true;
  //   ActivityService.getCategories($scope.new_search.category).then(function(resp) {
  //     $scope.categories = resp.subcategories;
  //   }).finally(function() {
  //     $scope.loadingCategories = false;
  //   });
  // }

}]);

angular.module('adbionic')

.controller('EventsCtrl', ["$scope", "$state", "$rootScope", "ActivityService", function($scope, $state, $rootScope, ActivityService) {
	var format = 'MMMM';
	var startDate = moment().startOf('month');
	var endDate = moment().endOf('month');
	$scope.month = startDate.format(format);
	$scope.activities_month = [];
	var categories = {};
	var activities_further = [];

	activate();

	///
	function activate() {
		$scope.loading_events = true;
	    ActivityService.getEvents({
	      initDate: startDate,
	      endDate: endDate
	    })
	    .then(function(resp) {
	      //activities - categories
	      	$scope.new_activities = [];
	      	$scope.activities = resp.activities;
	      	categories = resp.categories;
	      	var aux_start = startDate.clone();
	      	while (aux_start.isBefore(endDate)) {
		      	for (var i = 0; i < $scope.activities.length; i++) {
		      		if (aux_start.format('YYYY-M-DD') == $scope.activities[i].date) {
			      		$scope.activities[i].date = moment($scope.activities[i].date, 'YYYY-M-DD').format('dddd, DD');
			      		$scope.activities_month.push($scope.activities[i]);
			      		for (var j = 0; j < $scope.activities[i].events.length; j++) {
			      			if ($scope.activities[i].events[j].endDate == -1) {
			      				activities_further.push($scope.activities[i].events[j]);
			      				$scope.activities[i].events.splice(j, 1);
			      			}
			      		}
				      	$scope.activities[i].events = $scope.activities[i].events.concat(activities_further);
				    	break;
				    }
	      		}
	      		$scope.new_activities.push({ 
	      			date: aux_start.format('dddd, DD'),
	      			events: activities_further
	      		})

		      	aux_start.add(1, 'day');
	      	}
	      	console.log('...', $scope.new_activities)
	      	$scope.loading_events = false;
	    });
	}

	$scope.getActivityName = function(categoryId) {
		return categories[categoryId].name;
	}

	$scope.next = function() {
		startDate = startDate.add(1, 'months').startOf('month');
		endDate = startDate.clone().endOf('month');
		$scope.month = startDate.format(format);
		$scope.activities_month = [];
		activate();
	}

	$scope.prev = function() {
		startDate = startDate.subtract(1, 'months').startOf('month');
		endDate = startDate.clone().endOf('month');
		$scope.month = startDate.format(format);
		$scope.activities_month = [];
		activate();
	}
}]);

angular.module('adbionic')
.controller('GroupProfileCtrl', ["$scope", "$rootScope", "GroupService", function($scope,  $rootScope, GroupService) {
	
 	$scope.createGroup = function() {
	    $scope.loading = true;
	    var users = _.map($scope.new_members, function(contact) {
	      return contact.id;
	    });
	    var group = {};
	    group = angular.copy($scope.selected_group.room);
	    group.members = $scope.new_members;
	    group.users = users;
	    group.creator = $rootScope.user.id;
	    console.log(group);

	    GroupService.create(group).then(function(res) {
	      $scope.loading = false;
	      hideModalGroup();
	    });
  	};

  	$scope.updateGroup = function() {
	    $scope.loading = true;
	    GroupService.update(formatted($scope.selected_group.room)).then(function(res) {
	    	$scope.hideModalGroup();
	    }).finally(function() {
	      $scope.loading = false;
	    });
  	};

  	$scope.selectBuddy = function(buddy) {
	    buddy.invited = !buddy.invited;
	    var index = _.findIndex($scope.new_members, {id: buddy.id})
	    if (index > -1) {
	      $scope.new_members.splice(index, 1);
	    } else {
	      $scope.new_members.push(buddy);
	    }
  	}

 	//Format Group
  	function formatted(group) {
	    return {
	      id: group.id,
	      creator: $rootScope.user.id,
	      name: group.name,
	      isPrivate: group.isPrivate,
	      topic: group.topic,
	      roomImage: group.roomImage
	    };
  	}
}])
angular.module('adbionic')

.controller('HomeCtrl', ["$scope", "$state", function($scope, $state) {
  setTimeout(function(){ 
  	$state.go('login');
  }, 3000);
}]);

angular.module('adbionic')

.controller('LoginCtrl', ["$scope", "$state", "$rootScope", "$ionicPopup", "$auth", "Auth", "UserService", "UtilService", "$cordovaGeolocation",function($scope, $state, $rootScope, $ionicPopup, $auth, Auth, UserService, UtilService, $cordovaGeolocation) {
	console.log('Login');
	$scope.formLogin = {};
  $scope.loading = false;
  var days = 7;

  activate();
	//////
  
  function activate() {
    UtilService.getSettings().then(function(resp) {
      days = resp.settings.maxDaysToActivateAccount;
    });
  }
	
  $scope.authenticate = function(provider) {
        $auth.authenticate(provider).then(function(resp) {
            Auth.setCredentials(resp.data);
            $state.go('app.dashboard');
        }).catch(function(err) {
            console.log(err);
        });
  };
    //Geolocation
    var geocoder;
    geocoder = new google.maps.Geocoder();
                          
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
    .getCurrentPosition(posOptions)
    .then(function (position) {
            var lat  = position.coords.latitude;
            var long = position.coords.longitude;
            console.log("MY Location on Signup");
            console.log(lat);
            console.log(long);
            var latlng = new google.maps.LatLng(lat, long);
            var city;
            var country;
          
            geocoder.geocode({'latLng': latlng}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    console.log(results)
                    if (results[1]) {
                        //find country name
                        for (var i=0; i<results[0].address_components.length; i++) {
                            for (var b=0;b<results[0].address_components[i].types.length;b++) {
                                                 
                                //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                                 if (results[0].address_components[i].types[b] == "country") {
                                         //this is the object you are looking for
                                         country= results[0].address_components[i];
                                          break;
                                  }
                              }
                        }
                         //city data
                         $rootScope.country = country.long_name;
                                                 
                         //find country name
                         for (var i=0; i<results[0].address_components.length; i++) {
                               for (var b=0;b<results[0].address_components[i].types.length;b++) {
                                                 
                                   //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                                   if (results[0].address_components[i].types[b] == "locality") {
                                         //this is the object you are looking for
                                         city= results[0].address_components[i];
                                         break;
                                    }
                                }
                          }
                           //alert($scope.data.country);
                           //city data
                           $rootScope.city = city.long_name;
                                                 
                            } else {
                            }
                    } else {
                    }
                });
                                
            }, function(err) {
                console.log(err);
        });
                          
	$scope.loginAttempt = function() {
    $scope.error = false;
    $scope.loading = true;
    Auth.login($scope.formLogin).then(function(resp) {
        $rootScope.user = resp.user;
        if (!resp.user.userValidated && moment().diff(moment(resp.user.createdAt), 'day') > days) {
            $rootScope.userEmail = resp.user.email;
        } else {
            UserService.setLogin();
            if (!$scope.user.completedSignup) {
                $state.go('completesignup');
            } else {
              $state.go('app.dashboard');
            }
        }
    }, function(err) {
        var alertPopup = $ionicPopup.alert({
            title: 'Ups!',
            template: 'User or password invalid'
        });

        alertPopup.then(function(res) {
            console.log('User or password invalid');
        });
    }).finally(function() {
      $scope.loading = false;
    });
  };
}]);

angular.module('adbionic')
  .controller('NewSearchCtrl', ["$scope", "$rootScope", "$q", "$ionicPlatform", "$cordovaImagePicker", "ImageUploadFactory", "ActivityService", "UtilService", "uiGmapGoogleMapApi", "uiGmapIsReady","$timeout", function($scope, $rootScope, $q, $ionicPlatform, $cordovaImagePicker,
    ImageUploadFactory, ActivityService, UtilService, uiGmapGoogleMapApi, uiGmapIsReady,$timeout) {
    var format = 'DD/MM/YYYY hh:mm a';
    var PlacesAutocomplete = null;
    $scope.placesReady = false;
    $scope.map = {
      center: {
        latitude: 45.50174502816667,
        longitude: -73.5703881829977
      },
      zoom: 14,
      options: {
        scrollwheel: false
      },
      mapMarker: true,
      disableDefaultUI: true,
      control: {}
    };
    $scope.object = {
      filter: null
    }
    $scope.data = {};
    $scope.autoSearch = true;
    $scope.new_search = {};
    $scope.new_search.participants = [];
    $scope.new_search.imageGallery = [];
    $scope.new_search.category = 'social';
    $scope.new_search.activities = [];
    $scope.new_search.type = "public";
    getCategories();

    activateMap();

    function activateMap() {
      uiGmapGoogleMapApi.then(function(maps) {
        PlacesAutocomplete = new maps.places.AutocompleteService();

        uiGmapIsReady.promise(1).then(function(instances) {
          $scope.placesReady = true;
          $scope.map.instance = instances[0].map;
          Places = new maps.places.PlacesService($scope.map.instance);
        });
      });
    }

    $scope.getLocation = function() {
      if (!$scope.new_search.addressPlace) return;

      Places.getDetails({ placeId: $scope.new_search.addressPlace.place_id }, function(place, status) {
        $scope.new_search.location = place.geometry.location;
        console.log($scope.new_search)
      });
    };

    $scope.setLocation = function(item) {
      $scope.new_search.addressPlace = item;
      $scope.new_search.address = item.description;
      $scope.places = [];
      $scope.getLocation();
    }

    $scope.autocompleteAddress = function(address) {
        console.log(address);
        if (address) {
            PlacesAutocomplete.getPlacePredictions({ input: $scope.new_search.address }, function(result,status) {
                    console.log(result);
                    $scope.places = result;
            });
        }
    };

    $scope.clickActivity = function(activity) {
      var exist = _.findIndex($scope.new_search.activities, activity);
      if (exist > -1) {
        $scope.new_search.activities.splice(exist, 1);
        activity.added = false;
      } else if ($scope.new_search.activities.length < 5) {
        $scope.new_search.activities.push(activity);
        activity.added = true;
      }
    }

    $scope.selectCategory = function(category) {
      $scope.new_search.category = category;
      $scope.new_search.activities = [];
      getCategories();
    }

    $scope.nextStep = function() {
      $scope.step = $scope.step + 1 > 5 ? 5 : $scope.step + 1;
    }

    $scope.prevStep = function() {
      $scope.step = $scope.step - 1 < 1 ? 1 : $scope.step - 1;
    }

    $scope.clickBuddy = function(buddy) {
      var exist = _.findIndex($scope.new_search.participants, buddy);
      if (exist > -1) {
        $scope.new_search.participants.splice(exist, 1);
      } else {
        $scope.new_search.participants.push(buddy);
      }
    }

    $scope.checkBuddy = function(buddy) {
      return _.findIndex($scope.new_search.participants, buddy) > -1;
    }

    $scope.search = function() {
      $scope.loading = true;
      $scope.new_search.startDate = moment($scope.startDate, format);
      if ($scope.endDate == 'Until Further Notice') {
        $scope.new_search.endDate = -1;
      } else {
        $scope.new_search.endDate = moment($scope.endDate, format);
      }
      $scope.new_search.create = true;
      ActivityService.search($scope.new_search)
        .then(function(resp) {
          $scope.activities = ActivityService.mapMarkers(resp.users, resp.groupByLocation);
          $rootScope.$emit('newSearch');
          if ($scope.isFromChat) $rootScope.$emit('handshake', resp.activity[0]);
        }).finally(function() {
          $scope.loading = false;
          $scope.hideModalNewSearch();
        });
    };

    function getCategories() {
      $scope.loadingCategories = true;
      ActivityService.getCategories($scope.new_search.category).then(function(resp) {
        $scope.categories = resp.subcategories;
      }).finally(function() {
        $scope.loadingCategories = false;
      });
    }

    $scope.choosePicture = function() {
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
                $scope.new_search.imageGallery.push(resp.url);
                                                            
              })
              // $scope.new_search.imageGallery.push(results);
          }
        }, function(error) {
          console.log('Error: ' + JSON.stringify(error)); // In case of error
        });
      });
    }

    $scope.removeItem = function(index) {
      $scope.new_search.imageGallery.splice(index, 1);
    }

    $scope.unofficial = function() {
      $scope.new_search.activities.push({
        id: UtilService.uid(2),
        parent: $scope.new_search.category || 'social',
        name: _.capitalize(_.trim($scope.object.filter)),
        userId: UtilService.uid(10),
        isNew: true
      });
      $scope.object.filter = null;
    }

  }])

angular.module('adbionic')

.controller('NotificationsCtrl', ["$scope", "$state", "$rootScope", "$ionicPopup", "UserService", "NotificationService", function($scope, $state, $rootScope, $ionicPopup, UserService, NotificationService) {
  $scope.readed = [];
  $scope.notifications = NotificationService.list;
  clearNotifications();
    ////////////////

  $scope.handle = function(item, cancel) {
    item._loading = true;
    NotificationService[item.handler](item, cancel).then(function(resp) {
      item._loading = false;
      var index = _.findIndex($scope.notifications, function(o) {
        return o.id == item.id;
      });

      $scope.notifications[index].readed = true;
      UserService.readNotifications({
        ids: [item.id]
      });

      if (item.type == 'groupInvitation' && !cancel)
        $rootScope.$emit('updateGroups');
    });
  };

	$scope.showConfirm = function(item) {
   		var confirmPopup = $ionicPopup.confirm({
		  title: 'Do you want to accept this request or invitation?', // String. The title of the popup.
		  cssClass: 'popup-confirmation', // String, The custom CSS class name
		  cancelText: 'No', // String (default: 'Cancel'). The text of the Cancel button.
		  okText: 'Yes', // String (default: 'OK'). The text of the OK button.
		  okType: 'button-next'
		});

   		confirmPopup.then(function(res) {
	     	if(res) {
		       $scope.handle(item);
	     	} else {
		       $scope.handle(item, true);
	     	}
	   });
	};

  function clearNotifications() {
    if (!$scope.notifications.length) return;

    $scope.readed = [];
    for (var i = 0; i < $scope.notifications.length; ++i) {
      if (!$scope.notifications[i].isInvitation) {
        $scope.readed.push($scope.notifications[i].id);
        $scope.notifications[i].readed = true;
      }
    }

    UserService.readNotifications({
      ids: $scope.readed
    }).then(function(resp) {
      console.log(resp);
    });
  }
}]);
angular.module('adbionic')

.controller('SearchCtrl', ["$scope", "$rootScope", "ActivityService", function($scope, $rootScope, ActivityService) {
  	// $scope.invites = ActivityService.invites;

  	$scope.categories = ['handy', 'social', 'active'];
    activate();

    /////

    function activate() {
        $scope.activities = [];
        $scope.activities_archived = [];
    	$scope.loading_search = true;
        ActivityService.getSearches({}).then(function(resp) {
            for (var i = 0; i < resp.activities.length; i++) {
                if (resp.activities[i].archived) {
                    $scope.activities_archived.push(resp.activities[i])
                } else {
                    $scope.activities.push(resp.activities[i])
                }
            }
			$scope.aux_activities = angular.copy($scope.activities);
            $scope.loading_search = false;
      });
    }

    $scope.selectCategory = function(category) {
    	var index = $scope.categories.indexOf(category);
    	if (index > -1) {
    		$scope.categories.splice(index, 1);
    	} else {
    		$scope.categories.push(category);
    	}
    	clearActivities();
    }

    function clearActivities() {
    	var aux = []
    	for (var i = 0; i < $scope.activities.length; i++) {
    		if ($scope.categories.indexOf($scope.activities[i].category) > -1) {
    			aux.push($scope.activities[i]);
    		}
    	}
    	$scope.aux_activities = aux;
    }

    $rootScope.$on('newSearch', function(event, args) {
        activate();
    });
 }]);

angular.module('adbionic')
.controller('SearchDetailCtrl', ["$scope", "$rootScope", "$timeout", "ActivityService", "uiGmapGoogleMapApi", "uiGmapIsReady", function($scope, $rootScope, $timeout, ActivityService, uiGmapGoogleMapApi, uiGmapIsReady) {
    $scope.marker = {};
    $scope.mapVisible = false;
    $scope.map = {
        center: {
          latitude: 45.50174502816667,
          longitude: -73.5703881829977
        },
        zoom: 14,
        options: {
          scrollwheel: false
        },
        disableDefaultUI: true,
        control: {},
        streetViewControl: false
    };

    activate();

    function activate() {
        $scope.mapVisible = true;
        
        uiGmapGoogleMapApi.then(function(maps) {
            uiGmapIsReady.promise(1).then(function(instances) {

                $scope.map.instance = instances[0].map;
                mapEventToActivity();
                $scope.marker.id = 0;
                $scope.marker.location = $scope.map.center;
                $scope.marker.icon = ActivityService.getIcon($scope.activity.category);
                console.log($scope.marker)
                $scope.markers = [$scope.marker]; 
                $scope.participants.forEach( function(element, index) {
                  var index = _.find($scope.buddies, {id: element.id});
                  if (index) {
                    index.invited = true;
                  }
                });
            });
        });
    }

    $scope.selectBuddy = function(buddy) {
        buddy.invited = !buddy.invited;
        var index = _.findIndex($scope.participants, {id: buddy.id})
        if (index > -1) {
          $scope.participants.splice(index, 1);
        } else {
          $scope.participants.push(buddy);
        }
    }

    $scope.inviteSearch = function(){
        var invite = $scope.participants;
        if (!invite.length) return;

        ActivityService.invite({
          activity: $scope.activity.id,
          participants: invite
        }).then(function(resp) {
          $scope.hideModalSearch();
        }, function(err) {
          console.log(err);
        });
    }

    // Center Map
    function mapEventToActivity() {
        $scope.map.center = {
          latitude: $scope.activity.location[0],
          longitude: $scope.activity.location[1]
        };
    }

    // Trigger refresh when the map becomes visible
    $scope.$watch('mapVisible', function(current, original) {
        if (!current || !angular.isObject($scope.map.control)) return;

        $timeout(function() {
          $scope.map.control.refresh();
        }, 0);
    });
}]);
angular.module('adbionic')
.controller('SearchFindCtrl', ["$scope", "$rootScope", "$timeout", "uiGmapGoogleMapApi", "uiGmapIsReady", function($scope, $rootScope, $timeout, uiGmapGoogleMapApi, uiGmapIsReady) {
	var Places = null;
	var PlacesAutocomplete = null;
  	$scope.placesReady = false;
	$scope.map = {
	    center: {
	      latitude: 45.50174502816667,
	      longitude: -73.5703881829977
	    },
	    zoom: 14,
	    options: {
	      scrollwheel: false
	    },
	    mapMarker: true,
	    disableDefaultUI: true,
	    control: {}
	};
  	$scope.data = {};
    var format = 'DD/MM/YYYY hh:mm a';
    var start = "#datetimepicker-start";
    var end = "#datetimepicker-end";
	activateMap();

  	function activateMap() {
	    uiGmapGoogleMapApi.then(function(maps) {
	      	PlacesAutocomplete = new maps.places.AutocompleteService();

	      	uiGmapIsReady.promise(1).then(function(instances) {
		        $scope.placesReady = true;
		        $scope.map.instance = instances[0].map;
		        Places = new maps.places.PlacesService($scope.map.instance);
	      	});
	    });
  	}

  	$scope.getLocation = function() {
    	if (!$scope.new_search.addressPlace) return;

    	Places.getDetails({ placeId: $scope.new_search.addressPlace.place_id }, function(place, status) {
      		$scope.new_search.location = place.geometry.location;
		});
  	};

  	$scope.setLocation = function(item) {
  		$scope.new_search.addressPlace = item;
  		$scope.new_search.address = item.description;
  		$scope.places = [];
  		$scope.getLocation();
  	}

  	$scope.autocompleteAddress = function(address) {
	    if (address) {
		    PlacesAutocomplete.getQueryPredictions({ input: address }, function(data) {
	      		$scope.places = data;
	    	});
	    }
  	};

	$scope.clickActivity = function(activity) {
	    var exist = _.findIndex($scope.new_search.activities, activity);
	    if (exist > -1) {
	      $scope.new_search.activities.splice(exist, 1);
	      activity.added = false;
	    } else if ($scope.new_search.activities.length < 5) {
	      $scope.new_search.activities.push(activity);
	      activity.added = true;
	    }
  	}

  	// $scope.clickBuddy = function(buddy) {
	  //   var exist = _.findIndex($scope.new_search.participants, buddy);
	  //   if (exist > -1) {
	  //     $scope.new_search.participants.splice(exist, 1);
	  //   } else {
	  //     $scope.new_search.participants.push(buddy);
	  //   }
  	// }

  	// $scope.checkBuddy = function(buddy) {
	  //   return _.findIndex($scope.new_search.participants, buddy) > -1;
  	// }

	// Date Time Picker
  	$scope.now = function() {
	    $scope.startDate = moment().format(format);
	    $(start).data("DateTimePicker").date($scope.startDate);
  	};

  	$scope.until = function() {
	    $scope.active = false;

	    $timeout(function() {
	      $scope.endDate = 'Until Further Notice';
	    }, 0);
  	};
}])
angular.module('adbionic')
  .controller('SettingsCtrl', ["$scope", "$rootScope", "$ionicPlatform", "$cordovaImagePicker", "ImageUploadFactory", "UserService", "ActivityService", function($scope, $rootScope, $ionicPlatform, $cordovaImagePicker, ImageUploadFactory,
    UserService, ActivityService) {
    $scope.tab_settings = 1;
    $scope.data = {};

    activate();

    function activate() {
      ActivityService.getCategories('all').then(function(resp) {
        $scope.activities_all = resp.res;
        $scope.data.username = $rootScope.user.username;
        $scope.data.fullname = $rootScope.user.fullname;
        $scope.data.showName = $rootScope.user.showName;
        $scope.data.showUsername = $rootScope.user.showUsername;
        $scope.data.country = $rootScope.user.country;
        $scope.data.city = $rootScope.user.city;
        $scope.data.gender = $rootScope.user.gender;
        $scope.data.profileImage = $rootScope.user.profileImage;
        $scope.data.biography = $rootScope.user.biography;
        $scope.data.preferredActivities = $rootScope.user.preferredActivities;
        $scope.data.id = $rootScope.user.id;
        $scope.data.birth = moment($rootScope.user.birth).format('MMMM Do, YYYY');
        $scope.data.preferredActivities = $rootScope.user.preferredActivities || [];
        $scope.isValidDate = true;
        filterActivities();
      });
    }

    $scope.updateProfile = function() {
      $scope.loading = true;
      if (!$scope.data.showName && !$scope.data.showUsername) {
        if ($scope.data.fullname) {
          $scope.data.showName = true;
        }
        if ($scope.data.username) {
          $scope.data.showUsername = true;
        }
        if (!$scope.data.fullname && !$scope.data.username) {
          return;
        }
      }
      if (!$scope.data.fullname && !$scope.data.username) {
        return;
      }
      $scope.data.birth = moment($scope.data.birth, 'MMMM Do, YYYY')
      $scope.data.country = angular.isObject($scope.data.country) ? $scope.data.country.name : $scope.data.country;
      UserService.update($scope.data.id, $scope.data).then(function(resp) {
        $scope.error = false;
        $scope.hideModalSettings();
      }, function(err) {
        $scope.error = true;
      }).finally(function() {
        $scope.loading = false;
      });
    };

    $scope.selectPreferred = function(activity, category) {
      activity.user = !activity.user;
      var index = _.findIndex($scope.data.preferredActivities, {
        parent: category,
        name: activity.name
      })
      if (index > -1) {
        $scope.data.preferredActivities.splice(index, 1);
      } else {
        $scope.data.preferredActivities.push(activity);
      }
    }

    $scope.selectImage = function() {
      console.log('selecting image');
      // Image picker will load images according to these settings
      var options = {
        maximumImagesCount: 5, // Max number of selected images, I'm using only one for this example
        width: 800,
        height: 800,
        quality: 80 // Higher is better
      };
      $ionicPlatform.ready(function() {
        $cordovaImagePicker.getPictures(options).then(function(results) {
          // Loop through acquired images
          for (var i = 0; i < results.length; i++) {
            console.log('Image URI: ' + results[i]); // Print image URI
          }
          if (results.length > 0) {
            ImageUploadFactory.uploadImage(results[0]).then(function(resp) {
              console.log(resp)
              $scope.data.profileImage = resp.url;
            })
          }

        }, function(error) {
          console.log('Error: ' + JSON.stringify(error)); // In case of error
        });
      });


    }


    $scope.changePassword = function() {
      $scope.loading = true;

      UserService.changePassword({
        currentPassword: $scope.data.currentPassword,
        newPassword: $scope.data.newPassword,
        confirmNewPassword: $scope.data.confirmPassword
      }).then(function(res) {
        $scope.loading = false;
        $scope.hideModalSettings();
        $scope.error = false;
      }, function(err) {
        $scope.error = true;
        $scope.loading = false;
      });
    };

    $scope.validateDate = function() {
      $scope.isValidDate = moment($scope.data.birth, 'MMMM Do, YYYY').isValid();
    }

    function filterActivities() {
      $scope.data.preferredActivities.forEach(function(element, index) {
        var category = element.parent;
        if (category == 'Social') {
          var activities = $scope.activities_all['Social'];
          var index = _.find(activities, {
            name: element.name
          });
          if (index) {
            index.user = true;
          }
          $scope.activities_all['Social'] = _.sortBy(activities, ['user']);
        }
        if (category == 'Handy') {
          var activities = $scope.activities_all['Handy'];
          var index = _.find(activities, {
            name: element.name
          });
          if (index) {
            index.user = true;
          }
          $scope.activities_all['Handy'] = _.sortBy(activities, ['user']);
        }
        if (category == 'A') {
          var activities = $scope.activities_all['Training'];
          var index = _.find(activities, {
            name: element.name
          });
          if (index) {
            index.user = true;
          }
          $scope.activities_all['Training'] = _.sortBy(activities, ['user']);
        }
      });
    }
  }])

angular.module('adbionic')

.controller('SignUpCtrl', ["$scope", "$state", "$rootScope", "$ionicModal", "$auth", "$cordovaImagePicker", "ImageUploadFactory", "Auth", "UserService", "UtilService", "ActivityService","$cordovaGeolocation","LocalService","$ionicPlatform","$ionicScrollDelegate", function($scope, $state, $rootScope, $ionicModal, $auth, $cordovaImagePicker,
ImageUploadFactory, Auth, UserService, UtilService, ActivityService, $cordovaGeolocation,LocalService,$ionicPlatform,$ionicScrollDelegate) {
	  $scope.step = 1;
    $scope.loading = false;
    $scope.countries = UtilService.getCountries();
    $scope.data = {
        city: '',
        country: '',
        gender: 'M',
        birth: null,
        showName: true,
        showUsername: false,
        profileImage: UtilService.defaultAvatar,
        imageGallery: [],
        preferredActivities: []
    };
                           
    $scope.data.country = $rootScope.country;
    $scope.data.city = $rootScope.city;
                           
    $scope.availability = true;
    $scope.isConfirm = true;
    var format = 'MMMM Do, YYYY';
    activate();

	//////

  function activate() {
    $scope.loadingActivities = true;
    ActivityService.getCategories('all', {all: true, official: true}).then(function(resp) {
      $scope.activities = resp.res;
      $scope.loadingActivities = false;
    });
  }

    //Geolocation
    var geocoder;
    geocoder = new google.maps.Geocoder();
                          
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
    .getCurrentPosition(posOptions)
    .then(function (position) {
            var lat  = position.coords.latitude;
            var long = position.coords.longitude;
            console.log("MY Location on Signup");
            console.log(lat);
            console.log(long);
            var latlng = new google.maps.LatLng(lat, long);
            var city;
            var country;
          
            geocoder.geocode({'latLng': latlng}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    console.log(results)
                    if (results[1]) {
                        //find country name
                        for (var i=0; i<results[0].address_components.length; i++) {
                            for (var b=0;b<results[0].address_components[i].types.length;b++) {
                                                 
                                //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                                 if (results[0].address_components[i].types[b] == "country") {
                                         //this is the object you are looking for
                                         country= results[0].address_components[i];
                                          break;
                                  }
                              }
                        }
                         //city data
                         $scope.data.country = country.long_name;
                                                 
                         //find country name
                         for (var i=0; i<results[0].address_components.length; i++) {
                               for (var b=0;b<results[0].address_components[i].types.length;b++) {
                                                 
                                   //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                                   if (results[0].address_components[i].types[b] == "locality") {
                                         //this is the object you are looking for
                                         city= results[0].address_components[i];
                                         break;
                                    }
                                }
                          }
                           //alert($scope.data.country);
                           //city data
                           $scope.data.city = city.long_name;
                                                 
                            } else {
                                  alert("No results found");
                            }
                    } else {
                          alert("Geocoder failed due to: " + status);
                    }
                });
                                
            }, function(err) {
                console.log(err);
                alert("Geocoder failed due to: " + err);
                // error
        });

  // Basic Sign Up
	$scope.signAttempt = function() {
        $scope.loading = true;
        Auth.register($scope.data).then(function(resp) {
                                        console.log(resp);
            $rootScope.userEmail = resp.user.email;
            $rootScope.user = resp.user;
            $state.go('completesignup');
        }, function(err) {
            console.log(err);
            $scope.error = true;
        }).finally(function() {
            $scope.loading = false;
        });
    };

    $scope.authenticate = function(provider) {
        $auth.authenticate(provider).then(function(resp) {
            Auth.setCredentials(resp.data);
            $state.go('app.dashboard');
        }).catch(function(err) {
            console.log(err);
        });
    };

    $scope.checkCredentailsAvailability = function(credential) {
        var query = {};

        if (!$scope.data[credential]) {
            return;
        }

        $scope.loading = true;
        query[credential] = $scope.data[credential];
        Auth.credentialAvaliability(query).then(function(res) {
            $scope.availability = res.availability;
            $scope.loading = false;
        }, function(err) {
            console.log(err);
            $scope.loading = false;
        });
    };

    $scope.compare = function() {
        $scope.isConfirm = $scope.data.confirmPassword == $scope.data.password;
    };

// End Basic Sign Up

// Complete Sign Up
    $scope.validateDate = function() {
        $scope.isValidDate =  moment($scope.data.birth, format).isValid();
    }

    $scope.nextStep = function() {
        $scope.step++;
    $ionicScrollDelegate.scrollTop();
        if ($scope.step == 1) $rootScope.user.username = $scope.data.username;
    };

    $scope.previousStep = function() {
        if ($scope.step == 1) {
            $state.go('login');
        } else {
            $scope.step = $scope.step - 1 < 1 ? 1 : $scope.step - 1;
        }
    };

    $scope.autocompleteCountry = function(query) {
        return autocompleteCountry(query);
    };

    $ionicModal.fromTemplateUrl('templates/modal/signupModal.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal_signup = modal;
    });

    $scope.openSignModal = function(action, placeholder) {
        $scope.modal_signup.show();
        $scope.action = action;
        $scope.placeholder = placeholder;
    }

    $scope.okSignModal = function() {
        $scope.modal_signup.hide();
    }

    $scope.clickCountry = function(country) {
        $scope.data.country = country.name;
    }

    $scope.selectActivity = function(activity) {
        var exist = _.findIndex($scope.data.preferredActivities, activity);

        if (exist >= 0) {
            $scope.data.preferredActivities.splice(exist, 1);
        } else {
            $scope.data.preferredActivities.push(activity);
        }
    }

    $scope.checkActivity = function(activity) {
        return  _.findIndex($scope.data.preferredActivities, activity) >= 0;
    }

    $scope.complete = function() {
        LocalService.set('isRegisteredTutorial', "no");
        console.log($rootScope.user);
        UserService.update($rootScope.user.id,{completedSignup:true}).then(function(resp) {
        });
                           
        $scope.loading = true;
        $scope.data.completedSignup = true;
        $scope.data.country = $scope.data.country;
        $state.go('app.dashboard');
    };

    $scope.choosePicture = function() {
        // Image picker will load images according to these settings
        var options = {
            maximumImagesCount: 5, // Max number of selected images, I'm using only one for this example
            width: 400,
            height: 400,
            quality: 80 // Higher is better
        };
        $ionicPlatform.ready(function() {
            $cordovaImagePicker.getPictures(options).then(function(results) {
                // Loop through acquired images
            for (var i = 0; i < results.length; i++) {
                console.log('Image URI: ' + results[i]); // Print image URI
            }
            if (results.length > 0) {
                ImageUploadFactory.uploadImage(results[0]).then(function(resp) {
                    $scope.data.profileImage = resp.url;
                    UserService.update($rootScope.user.id, {profileImage: resp.url, imageGallery: $rootScope.user.imageGallery.push(resp.url)}).then(function(rest){
                    });
                                                                
                    /*UserService.update($rootScope.user.id,{profileImage:resp.url}).then(function(resp) {
                    });*/
                })
            }
            }, function(error) {
              console.log('Error: ' + JSON.stringify(error)); // In case of error
            });
        });
    }

    function autocompleteCountry(query) {
        var results = query ? $scope.countries.filter(createFilterFor(query)) : $scope.countries;
        return results;
    }

    function createFilterFor(query) {
        var capitalizeQuery = _.capitalize(query);
        return function filterFn(country) {
            return (country.name.indexOf(capitalizeQuery) === 0);
        };
    }
}]);

angular.module('adbionic')

.controller('VibeCtrl', ["$scope", "$state", "$rootScope", "$timeout", "uiGmapGoogleMapApi", "uiGmapIsReady", "UtilService", "ActivityService", function($scope, $state, $rootScope, $timeout,
	uiGmapGoogleMapApi, uiGmapIsReady, UtilService, ActivityService) {

    $scope.radius = 0;
    $scope.bounds = null;
    $scope.marker = null;
    $scope.loading = true;
    $scope.activity = null;
    $scope.activities = [];
    $scope.participants = {};
    $scope.mapVisible = false;
    $scope.allActivities = [];
    $scope.filter = {
      categories: UtilService.getCategories(),
      selectedCategories: []
    };
                         
    $scope.isOffering = false;
    $scope.map = {
      center: {
        latitude: 45.50174502816667,
        longitude: -73.5703881829977
      },
      zoom: 14,
      options: {
        scrollwheel: false
      },
      control: {},
      events: { idle: boundsChanged }
    };

    activate();

    ////////////////

    function activate() {
      	uiGmapGoogleMapApi.then(function(maps) {
	        uiGmapIsReady.promise(1).then(function(instances) {
            console.log("55555555");
            console.log(instances);
	          	$scope.map.instance = instances[0].map;
	          	$scope.bounds = $scope.map.instance.getBounds();
	          	vibe();
	        });
      	});
    }

    function vibe() {
      	UtilService.getLocation()
	        .then(function(location) {
	          $scope.location = location;
	          centerMap($scope.map.instance, $scope.location);
	        }).finally(function() {
	          $scope.mapVisible = true;
	        });
    }

    $scope.resetFilter = function() {
      	$scope.filter = {
	        categories: UtilService.getCategories(),
	        selectedCategories: []
      	};
    };

    $scope.markerClick = function(marker, eventName, model) {
                         alert(eventName);
      	if (!model.hasOwnProperty('text') &&
	        !angular.isObject(model.activities[0].name)) {
	        model.activities = ActivityService.populateCategory($scope.categories, model.activities);
      	}

      	$scope.marker = model;
      	$scope.marker.current = {};
      	$scope.marker.show = !$scope.marker.show;
    };

    $scope.updateMap = function(key, category) {
      	$scope.activity = key;
      	$scope.activities = ActivityService.mapMarkers($scope.users, category);
      	$scope.activities.push(locationMarker());
      	$scope.activities[$scope.activities.length - 1].id = $scope.activities.length - 1;
    };

    $scope.openActivity = function(activity) {
      	if (!angular.isObject(activity[0].name))
        	activity = ActivityService.populateCategory($scope.categories, activity);

      	$scope.marker = {
	        current: {},
	        location: {
	          latitude: activity[0].location[0],
	          longitude: activity[0].location[1]
	        },
	        activities: activity,
	        users: $scope.users,
	        show: $scope.marker ? (_.isEqual($scope.marker.activities, activity) ? !$scope.marker.show : true) : true
      	};

      	if ($scope.marker.show) {
	        centerMap($scope.map.instance, {
	          lat: $scope.marker.location.latitude,
	          lng: $scope.marker.location.longitude
	        }, true);
      	}
    };

    $scope.closeActivity = function() {
      	$scope.activity = null;
      	angular.copy($scope.allActivities, $scope.activities);

      	if ($scope.marker)
        	$scope.marker.show = false;
    };

    $scope.participantsCount = function(location) {
      	var count = 0;
      	for (var i = location.length - 1; i >= 0; --i) {
        	count += location[i].participants.length;
      	}
      	return count;
    };

    $scope.joinTheVibe = function() {
      	var activity = $scope.marker.current;
      	addToBuddies(activity.requester);
      	ActivityService.join(activity._id).then(function(resp) {})
    };

    function addToBuddies(id) {
      	// type: 1 for map, 0 for buddyNumber
      	FriendshipService.invite({ userId: id, type: 1 })
	        .then(function(resp) {
	          UtilService.showToast('Invitation sent');
	        }, function(err) {
	          console.log(err);
	        });
    };

    function computeParticipants() {
      	var activities = [];

      	angular.forEach($scope.data, function(activity, key) {
	        var count = 0;

	        angular.forEach(activity, function(location, key) {
	          count += $scope.participantsCount(location) + location.length;
	        });

	        if ($scope.activity && $scope.activity == key)
	          $scope.updateMap($scope.activity, activity);

	        $scope.participants[key] = count;

	        activities.push(ActivityService.mapMarkers($scope.users, activity))
      	});

      	// Sorting data by number of participants
      	var sortable = [];
      	var aux = {};
      	for (var key in $scope.participants)
	        sortable.push([key, $scope.participants[key]])
	      		sortable.sort(function(a, b) {
	        	return b[1] - a[1]
      		})

      	for (var i = 0; i < sortable.length; i++) {
	        var key = sortable[i][0];
	        aux[key] = $scope.data[key];
      	}

      	$scope.data = aux;

      	$scope.allActivities = [].concat.apply([], activities);
      	$scope.allActivities.push(locationMarker());
      	$scope.allActivities.map(function(o, i) { o.id = i; })
      	if (!$scope.activity) angular.copy($scope.allActivities, $scope.activities);
    }

    function centerMap(map, location, offset) {
      	$timeout(function() {
	        map.panTo(location);
      	}, 100);
    }

    function locationMarker() {
      	return {
	        text: 'This is you!',
	        location: {
	          latitude: $scope.location.lat,
	          longitude: $scope.location.lng
	        },
	        icon: ActivityService.marker('green', 1)
      	}
    }

    function updateVibe() {
      	var params = {
	        startDate: moment().format(),
	        endDate: moment().format(),
	        //categories: ['social', 'handy', 'active'],
          //lat: $scope.location.lat,
	        //lng: $scope.location.lng,
	        categories:['social'],
          lat:45.6140997145276,
          lng:-73.716364,
	        radius: $scope.radius
      	};
        console.log(params);
      	$scope.loading = true;
      	ActivityService.vibe(params).then(function(resp) {
	        $scope.data = resp.vibe;
	        $scope.users = resp.users;
	        $scope.categories = resp.categories;
	        computeParticipants();
      	}).finally(function() {
        	$scope.loading = false;
      	});
    }

    function viewPortRadius() {
      	var r = 3963.0;
      	var ne = $scope.bounds.getNorthEast();
      	var center = $scope.bounds.getCenter();
        if (!$scope.location) return;
      	var lat1 = $scope.location.lat / 57.2958;
      	var lng1 = $scope.location.lng / 57.2958;
      	var lat2 = center.lat() / 57.2958;
      	var lng2 = center.lng() / 57.2958;

      	var centerDistance = r * Math.acos(Math.sin(lat1) * Math.sin(lat2) +
        	Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1));

      	lat2 = ne.lat() / 57.2958;
      	lng2 = ne.lng() / 57.2958;

      	var aperture = r * Math.acos(Math.sin(lat1) * Math.sin(lat2) +
        	Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1));

      	if (centerDistance + aperture > $scope.radius && aperture < 1000) {
        	$scope.radius = (centerDistance + aperture).toFixed(2);

        	updateVibe();
      	}
    }

    function boundsChanged() {
      	if (!$scope.map.instance) return;

      	$scope.bounds = $scope.map.instance.getBounds();
      	viewPortRadius();
    }


    // Trigger refresh when the map becomes visible
    $scope.$watch('mapVisible', function(current, original) {
      	if (!current || !angular.isObject($scope.map.control)) return;

      	$timeout(function() {
        	$scope.map.control.refresh();
      	}, 0);
    });


    var timeoutPromise;
    $scope.$watch('filter', function(current, original) {
    	console.log(current)
      	if (current == original || !$scope.location) return;
      	$timeout.cancel(timeoutPromise);
      	var categories = [];
      	var selectedCategories = current.selectedCategories;

      	timeoutPromise = $timeout(function() {
	        var params = {
	          startDate: current.startDate ? moment(current.startDate).format() : null,
	          endDate: current.endDate ? moment(current.endDate).format() : null,
	          categories: selectedCategories,
	          activity: current.search,
	          //lat: $scope.location.lat,
	          //lng: $scope.location.lng,
            lat:45.6140997145276,
            lng:-73.716364,
	          radius: $scope.radius,
	        };

        ActivityService.vibe(params).then(function(resp) {
          	$scope.data = resp.vibe;
          	$scope.users = resp.users;
          	$scope.categories = resp.categories;
          	$scope.participants = {};
          	$scope.data_original = angular.copy($scope.data);
          	computeParticipants();
        }).finally(function() {
          $scope.loading = false;
        });
      }, 500);

    }, true);

    $scope.$watch('$scope.isOffering', function(current, original) {
      	if (current == original) return;
      	if ($scope.filter.selectedCategories == 'handy') {
	        $scope.data_aux = {};
	        angular.forEach($scope.data_original, function(activity, key_activity) {
	          angular.forEach(activity, function(location, key) {
	            if (location[0].isOffering == $scope.isOffering) {
	              $scope.data_aux[key_activity] = $scope.data_original[key_activity];
	            }
	          });
	        });
	        $scope.data = angular.copy($scope.data_aux);
	        $scope.participants = {};
	        computeParticipants();
      	}
    })

}]);

(function() {
  'use strict';

  angular
    .module('adbionic')
    .directive('adbMessageActivity', adbMessageActivity);

  function adbMessageActivity() {
    var directive = {
      restrict: 'EA',
      controller: Controller,
      templateUrl: 'js/directives/adbMessageActivity.html',
      scope: {
        'pattern': '=adbMessageActivity'
      }
    };
    return directive;

  }

  function Controller(_, $scope, $rootScope, ActivityService) {

    activate();

    ////////////////

    function activate() {
      console.log($scope.pattern)
      $scope.loading = true;
      $scope.activityId = getId();
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

    function getId() {
      var split = $scope.pattern.split('[search:');
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

    function openSearch(activity) {
      ActivityService.setUpdate(activity);
    }
  }
})();

(function() {
  'use strict';

  angular
    .module('adbionic')
    .directive('ngEnter', function() {
      return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
          if (event.which === 13) {
            scope.$apply(function() {
              scope.$eval(attrs.ngEnter);
            });

            event.preventDefault();
          }
        });
      };
    });

})();

/**
 * @ngdoc filter
 * @name capitalize
 * @description 
 * 
 * Capitalizes the given string.
 * 
 */
(function() {
  'use strict';

  angular
    .module('adbionic')
    .filter('capitalize', capitalizeFilter);

  function capitalizeFilter() {
    return capitalize;

    ////////////////

    function capitalize(string) {
      return (!!string) ? string.charAt(0).toUpperCase() + string.substr(1).toLowerCase() : '';
    }
  }

})();

/**
 * @ngdoc filter
 * @name empty
 * @description 
 * 
 * Check if a given object is empty.
 * 
 */
(function() {
  'use strict';

  angular
    .module('adbionic')
    .filter('empty', emptyFilter);

    emptyFilter.$inject = ['_'];

  function emptyFilter(_) {
    return empty;

    ////////////////

    function empty(object) {
      return _.isEmpty(object);
    }
  }

})();

/**
 * @ngdoc filter
 * @name isActivity
 * @description 
 * 
 * Check if a given object is an Activity.
 * 
 */
(function() {
  'use strict';

  angular
    .module('adbionic')
    .filter('isActivity', isActivityFilter);

  function isActivityFilter() {
    return isActivity;

    ////////////////

    function isActivity(string) {
      return string.match(/^\[search:[a-zA-Z0-9_]*\]/gi);
    }
  }

})();

/**
 * @ngdoc filter
 * @name keys
 * @description 
 * 
 * Returns keys of given object.
 * 
 */
(function() {
  'use strict';

  angular
    .module('adbionic')
    .filter('keys', keysFilter);

  function keysFilter() {
    return keys;

    ////////////////

    function keys(object) {
      return Object.keys(object);
    }
  }

})();
(function() {
  'use strict';

  angular
    .module('adbionic')
    .filter('lastItem', lastItemFilter);

  lastItemFilter.$inject = ['_'];

  function lastItemFilter(_) {
    return lastItem;

    ////////////////

    function lastItem(array) {
      return _.isArray(array)?array[array.length - 1]:{};
    }
  }

})();

(function() {
  'use strict';

  angular
    .module('adbionic')
    .filter('message', messageFilter);

  messageFilter.$inject = ['isActivityFilter'];

  function messageFilter(isActivityFilter) {
    return message;

    ////////////////

    function message(string) {
      if (isUrl(string)) return 'Photo';
      if (isActivityFilter(string)) return 'Activity';
      return string;
    }

    function isUrl(string) {
      var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
      return regex.test(string);
    }
  }

})();

/**
 * @ngdoc filter
 * @name myBuddy
 * @description 
 * 
 * Checks if an user is our buddy;
 * 
 */
(function() {
  'use strict';

  angular
    .module('adbionic')
    .filter('myBuddy', myBuddyFilter);

    myBuddyFilter.$inject = ['FriendshipService'];

  function myBuddyFilter(FriendshipService) {
    return myBuddy;

    ////////////////

    function myBuddy(buddyId) {
      return FriendshipService.find(buddyId) != -1;
    }
  }

})();

/**
 * @ngdoc filter
 * @name objectOrder
 * @description 
 * 
 * Capitalizes the given string.
 * 
 */
(function() {
  'use strict';

  angular
    .module('adbionic')
    .filter('objectOrder', objectOrderFilter);

  function objectOrderFilter() {
    return objectOrder;

    ////////////////

    function objectOrder(items, field, reverse) {

      function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }

      var filtered = [];

      angular.forEach(items, function(item, key) {
        item.key = key;
        filtered.push(item);
      });

      function index(obj, i) {
        return obj[i];
      }

      filtered.sort(function(a, b) {
        var comparator;
        var reducedA = field.split('.').reduce(index, a);
        var reducedB = field.split('.').reduce(index, b);

        if (isNumeric(reducedA) && isNumeric(reducedB)) {
          reducedA = Number(reducedA);
          reducedB = Number(reducedB);
        }

        if (reducedA === reducedB) {
          comparator = 0;
        } else {
          comparator = reducedA > reducedB ? 1 : -1;
        }

        return comparator;
      });

      if (reverse) {
        filtered.reverse();
      }

      return filtered;
    };
  }

})();

(function() {
  'use strict';

  angular
    .module('adbionic')
    .filter('unread', unreadFilter);

  unreadFilter.$inject = ['$rootScope'];

  function unreadFilter($rootScope) {
    return unread;

    ////////////////

    function unread(c) {
      var unread = [];

      for (var i = c.length - 1; i >= 0; --i) {
        if (!c[i].hasOwnProperty('messages') || !c[i].messages.length) continue;

        if (c[i].messages[c[i].messages.length - 1].status != 'read')
          unread.push(c[i]);
      }

      return unread;
    }
  }

})();

(function() {
  'use strict';

  angular
    .module('adbionic')
    .factory('ActivityService', ActivityService);

  ActivityService.$inject = ['BaseApiUrl', '_', 'moment', '$http', '$q', '$rootScope'];

  function ActivityService(BaseApiUrl, _, moment, $http, $q, $rootScope) {
    var service = {
      categories: [],
      searches: [],
      invites: [],
      data: {
        activities: [],
        participants: []
      },
      date: {},

      getSearchesInvited: getSearchesInvited,
      acceptInvitation: acceptInvitation,
      populateCategory: populateCategory,
      rejectInvitation: rejectInvitation,
      calendarEvents: calendarEvents,
      getCategories: getCategories,
      getSearches: getSearches,
      acceptRequest: acceptRequest,
      rejectRequest: rejectRequest,
      mapMarkers: mapMarkers,
      vibeFilter: vibeFilter,
      getEvents: getEvents,
      clearData: clearData,
      setUpdate: setUpdate,
      getDetail: getDetail,
      search: search,
      update: update,
      remove: remove,
      invite: invite,
      marker: marker,
      join: join,
      kick: kick,
      vibe: vibe,
      getIcon:getIcon
    };

    return service;

    function search(params) {
      var deferred = $q.defer();

      $http.post(BaseApiUrl + '/activity/', formatted(params))
        .success(function(data, status, headers, config) {
          populateActivities(data);
          populateRequesters(data);
          addSearches(data.activity);
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function update(params) {
      var deferred = $q.defer();

      $http.put(BaseApiUrl + '/activity/', formatted(params))
        .success(function(data, status, headers, config) {
          getSearches({});
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    function remove(activity) {
      var deferred = $q.defer();

      $http.delete(BaseApiUrl + '/activity/' + activity)
        .success(function(data) {
          getSearches();
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    function vibe(params) {
      var deferred = $q.defer();
      console.log("/activity/vibe/1");
      $http.get(BaseApiUrl + '/activity/vibe/', { params: params })
        .success(function(data) {
          populateActivities(data);
          populateRequesters(data);
          addSearches(data.activity);
          data.location = params;
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    function invite(payload) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/activity/invite/', payload)
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
      $http.post(BaseApiUrl + '/activity/kick/', payload)
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }


      function acceptRequest(payload) {
        var deferred = $q.defer();
        $http.post(BaseApiUrl + '/activity/acceptRequest/', payload)
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
        $http.post(BaseApiUrl + '/activity/rejectRequest/', payload)
          .success(function(data) {
            deferred.resolve(data);
          })
          .error(function(err) {
            deferred.reject(err);
          });
        return deferred.promise;
      }


    function join(activity) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/activity/join/', {
        activity: activity
      })
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getEvents(params) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/activity/daily/', params)
        .success(function(resp) {
          deferred.resolve(resp);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getCategories(parent) {
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/category/' + parent + '?all=true')
        .success(function(resp) {
          deferred.resolve(resp);
          angular.copy(resp.subcategories, service.categories);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getSearchesInvited() {
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/user/activities/invited/')
        .success(function(resp) {
          deferred.resolve(resp);
          angular.copy(resp, service.invites);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getSearches(params) {
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/user/activities/', { params: params })
        .success(function(resp) {
          deferred.resolve(resp);
          angular.copy(resp.activities, service.searches);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getDetail(activityId) {
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/activity/view/' + activityId)
        .success(function(resp) {
          deferred.resolve(resp);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function vibeFilter(params) {
        var deferred = $q.defer();
        console.log("/activity/vibe/2");
      $http.get(BaseApiUrl + '/activity/vibe/', { params: params })
        .success(function(data) {
          populateActivities(data);
          populateRequesters(data);
          addSearches(data.activity);
          data.location = params;
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    function mapMarkers(users, locations) {
      var groups = [];
      var index = 0;

      for (var key in locations) {
        groups.push({
          id: index++,
          users: users,
          activities: locations[key],
          location: {
            latitude: locations[key][0].location[0],
            longitude: locations[key][0].location[1]
          },
          icon: getIcon(locations[key][0].category) //locations[key][0].name.isService ? marker('blue', 1) : marker('red', 1)
        });
      }

      return groups;
    }

    function getIcon(category) {
      if (category == 'social')
        return 'img/dark-tiny-social.png';
      if (category == 'handy')
        return 'img/dark-tiny-handy.png';
      if (category == 'active')
        return 'img/dark-tiny-active.png';
    }

    function addSearches(searches) {
      if (!searches) return;

      angular.copy(searches.concat(service.searches), service.searches);
    }

    function populateRequesters(data) {
      for (var key in data.groupByLocation) {
        populateUser(data.users, data.groupByLocation[key]);
      }
    }

    function populateUser(users, activities) {
      if (!activities || !users) return;

      for (var i = activities.length - 1; i >= 0; --i) {
        activities[i].requester = users[activities[i].requester];
      }

      return activities;
    }

    function populateActivities(data) {
      for (var key in data.groupByLocation) {
        populateCategory(data.categories, data.groupByLocation[key]);
      }
      populateCategory(data.categories, data.activity);
    }

    function populateCategory(categories, activities) {
      if (!activities || !categories) return;

      for (var i = activities.length - 1; i >= 0; --i) {
        activities[i].name = categories[activities[i].name];
      }

      return activities;
    }

    function populateParticipants() {

    }

    function clearData() {
      service.data = {
        activities: [],
        participants: []
      };
    }

    function formatted(data) {
      data.requester = $rootScope.user.id;
      data.startDate = moment(data.startDate).format();
      data.endDate = data.endDate == -1 ? -1 : moment(data.endDate).format();

      return data;
    }

    function setUpdate(data) {
      data = JSON.parse(JSON.stringify(data));
      data.create = false;
      data.existing = true;
      data.activities = [data.name];
      data.participants = data.participants ? data.participants : [];
      delete data.name;
      angular.copy(data, service.data);
    }

    function calendarEvents(categories, events) {
      var formattedEvents = [];

      angular.forEach(events, function(o) {
        var dayEvents = _.filter(o.events, { 'archived': false });

        if (dayEvents.length)
          formattedEvents.push({
            title: dayEvents.length,
            start: moment(o.date, 'YYYY-MM-DD').toDate(),
            end: moment('2016-06-07', 'YYYY-MM-DD').toDate(),
            events: populateCategory(categories, dayEvents),
            allDay: true,
            className: eventClass(dayEvents)
          });
      });

      return formattedEvents;
    }

    function eventClass(events) {
      var invited = _.filter(events, { status: 'accepted' });

      if (!invited.length) return 'normal-event';
      if (invited.length == events.length) return 'invited-event';

      return 'mixed-event';
    }

    function rejectInvitation(data) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/activity/reject/', {
          activity: data.activity
        })
        .success(function(resp) {
          deferred.resolve(resp);
          //angular.copy(resp.activities, service.searches);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function acceptInvitation(data) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/activity/accept/', {
          activity: data.activity
        })
        .success(function(resp) {
          deferred.resolve(resp);
          angular.copy(resp.activities, service.invites);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function marker(color, scale) {
      var icon = 'spotlight-poi.png';
      var base = 'http://mt.googleapis.com/vt/icon/name=icons/spotlight/';

      if (color == 'blue') icon = 'spotlight-waypoint-blue.png';
      if (color == 'green') icon = 'spotlight-waypoint-a.png';

      return base + icon + '&scale=' + scale;
    }

  }
})();

(function() {
  'use strict';

  AuthInterceptor.$inject = ["$q", "LocalService", "$injector"];
  angular
    .module('adbionic')
    .factory('Auth', Auth)
    .factory('AuthInterceptor', AuthInterceptor)
    .config(["$httpProvider", function($httpProvider) {
      $httpProvider.interceptors.push('AuthInterceptor');
      $httpProvider.defaults.withCredentials = true;
    }]);

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

angular.module('adbionic')
.factory('ImageUploadFactory', ["$q", "$ionicLoading", "$cordovaFileTransfer", function ($q, $ionicLoading, $cordovaFileTransfer) {
  return {          
      uploadImage: function (imageURI) {
            console.log('start upload image.');
            var deferred = $q.defer();

            uploadFile();

            function uploadFile() {
              $ionicLoading.show({template : 'Uploading image...'});
              // Add the Cloudinary "upload preset" name to the headers
              var uploadOptions = {
                params : { 
                  'upload_preset': 'sm2ev4nu',
                  'timestamp': Date.now() / 1000 | 0,
                  'api_key': 839988333153567
                }
              };
              $cordovaFileTransfer
                // Your Cloudinary URL will go here
                .upload('https://api.cloudinary.com/v1_1/cloud9/image/upload', imageURI, uploadOptions)

                .then(function(result) {
                  // Let the user know the upload is completed
                  $ionicLoading.show({template : 'Done.', duration: 1000});
                  var response = JSON.parse(decodeURIComponent(result.response));
                  deferred.resolve(response);
                }, function(err) {
                  // Uh oh!
                  $ionicLoading.show({template : 'Failed.', duration: 3000});
                  deferred.reject(err);
                }, function (progress) {

                });
            }
            return deferred.promise;
      },
  }
}]);
(function() {
  'use strict';

  angular.module('adbionic').
  factory('interceptorsService', interceptorsService);

  interceptorsService.$inject = ['$q'];

  function interceptorsService($q) {
    var interceptor = {
      'request': function(config) {

        return config;
      },
      'response': function(response) {
        return response;
      },
      'responseError': function(rejection) {
        console.log(rejection.data);
        if (rejection.status === 401) {
          console.log('unauthorized');
        }
        return $q.reject(rejection);
      },
      'requestError': function(rejection) {
        console.log(rejection);
        return $q.reject(rejection);
      },
    };

    return interceptor;
  }
})();

(function() {
  'use strict';

  angular.module('adbionic')
    .factory('LocalService', function() {
      return {
        get: function(key) {
          return localStorage.getItem(key);
        },
        set: function(key, val) {
          return localStorage.setItem(key, val);
        },
        unset: function(key) {
          return localStorage.removeItem(key);
        }
      };
    });
}());

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

(function() {
  'use strict';

  angular
    .module('adbionic')
    .factory('UtilService', factory);

  factory.$inject = ['BaseApiUrl', 'version', '$http', '$q', '$window', '$ionicPlatform', '$cordovaGeolocation'];

  function factory(BaseApiUrl, version, $http, $q, $window, $ionicPlatform, $cordovaGeolocation) {
    var service = {
      words: [],
      settings: {
        maxDaysToActivateAccount: 7,
      },
      locale: getLanguage(),
      defaultAvatar: 'http://res.cloudinary.com/dy14eiv7n/image/upload/v1458829528/default_avatar.png',

      uid: uid,
      showToast: showToast,
      getBadWords: getBadWords,
      getSettings: getSettings,
      getLocation: getLocation,
      getCountries: getCountries,
      getCategories: getCategories,
      mergeObjects : mergeObjects
    };

    return service;

    function uid(len) {
      var buf = [],
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        charlen = chars.length;

      for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
      }

      return buf.join('');
    }

    function showToast(message) {
      var toast = $mdToast.simple()
        .textContent(message)
        .action('OK')
        .highlightAction(false)
        .position('top right');

      $mdToast.show(toast);
    }

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getBadWords() {
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/badwords/')
        .success(function(resp) {
          angular.copy(resp.words.map(function(e) {
            return e.toLowerCase();
          }), service.words);
          deferred.resolve(resp);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getSettings() {
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/settings/' + version)
        .success(function(resp) {
          deferred.resolve(resp);
          angular.copy(resp.settings, service.settings);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getLocation() {
      // var params = {};
        var deferred = $q.defer();

      // $window.navigator.geolocation.getCurrentPosition(function(position) {
      //   params.lat = position.coords.latitude;
      //   params.lng = position.coords.longitude;

      //   deferred.resolve(params);
      // });
        $ionicPlatform.ready(function() {
            $cordovaGeolocation
            .getCurrentPosition({ timeout: 10000, enableHighAccuracy: false })
            .then(function(position) {
                deferred.resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            });
        });

        return deferred.promise;

    }

    function getLanguage() {
      return $window.navigator.language.substring(0, 2);
    }

    function getCategories() {
      return [{
        name: 'Social',
        value: 'social'
      }, {
        name: 'Active',
        value: 'active'
      }, {
        name: 'Services',
        value: 'handy'
      }];
    }


    function mergeObjects(roles) {
      // Custom merge function ORs together non-object values, recursively
      // calls itself on Objects.
      var merger = function (a, b) {
        if (_.isObject(a)) {
          return _.merge({}, a, b, merger);
        } else {
          return a || b;
        }
      };

      // Allow roles to be passed to _.merge as an array of arbitrary length
      var args = _.flatten([{}, roles, merger]);
      return _.merge.apply(_, args);
    }

    function getCountries() {
      return [
        { name: 'Afghanistan', id: 'AF' },
        { name: 'Åland Islands', id: 'AX' },
        { name: 'Albania', id: 'AL' },
        { name: 'Algeria', id: 'DZ' },
        { name: 'American Samoa', id: 'AS' },
        { name: 'AndorrA', id: 'AD' },
        { name: 'Angola', id: 'AO' },
        { name: 'Anguilla', id: 'AI' },
        { name: 'Antarctica', id: 'AQ' },
        { name: 'Antigua and Barbuda', id: 'AG' },
        { name: 'Argentina', id: 'AR' },
        { name: 'Armenia', id: 'AM' },
        { name: 'Aruba', id: 'AW' },
        { name: 'Australia', id: 'AU' },
        { name: 'Austria', id: 'AT' },
        { name: 'Azerbaijan', id: 'AZ' },
        { name: 'Bahamas', id: 'BS' },
        { name: 'Bahrain', id: 'BH' },
        { name: 'Bangladesh', id: 'BD' },
        { name: 'Barbados', id: 'BB' },
        { name: 'Belarus', id: 'BY' },
        { name: 'Belgium', id: 'BE' },
        { name: 'Belize', id: 'BZ' },
        { name: 'Benin', id: 'BJ' },
        { name: 'Bermuda', id: 'BM' },
        { name: 'Bhutan', id: 'BT' },
        { name: 'Bolivia', id: 'BO' },
        { name: 'Bosnia and Herzegovina', id: 'BA' },
        { name: 'Botswana', id: 'BW' },
        { name: 'Bouvet Island', id: 'BV' },
        { name: 'Brazil', id: 'BR' },
        { name: 'British Indian Ocean Territory', id: 'IO' },
        { name: 'Brunei Darussalam', id: 'BN' },
        { name: 'Bulgaria', id: 'BG' },
        { name: 'Burkina Faso', id: 'BF' },
        { name: 'Burundi', id: 'BI' },
        { name: 'Cambodia', id: 'KH' },
        { name: 'Cameroon', id: 'CM' },
        { name: 'Canada', id: 'CA' },
        { name: 'Cape Verde', id: 'CV' },
        { name: 'Cayman Islands', id: 'KY' },
        { name: 'Central African Republic', id: 'CF' },
        { name: 'Chad', id: 'TD' },
        { name: 'Chile', id: 'CL' },
        { name: 'China', id: 'CN' },
        { name: 'Christmas Island', id: 'CX' },
        { name: 'Cocos (Keeling) Islands', id: 'CC' },
        { name: 'Colombia', id: 'CO' },
        { name: 'Comoros', id: 'KM' },
        { name: 'Congo', id: 'CG' },
        { name: 'Congo, The Democratic Republic of the', id: 'CD' },
        { name: 'Cook Islands', id: 'CK' },
        { name: 'Costa Rica', id: 'CR' },
        { name: 'Cote D\'Ivoire', id: 'CI' },
        { name: 'Croatia', id: 'HR' },
        { name: 'Cuba', id: 'CU' },
        { name: 'Cyprus', id: 'CY' },
        { name: 'Czech Republic', id: 'CZ' },
        { name: 'Denmark', id: 'DK' },
        { name: 'Djibouti', id: 'DJ' },
        { name: 'Dominica', id: 'DM' },
        { name: 'Dominican Republic', id: 'DO' },
        { name: 'Ecuador', id: 'EC' },
        { name: 'Egypt', id: 'EG' },
        { name: 'El Salvador', id: 'SV' },
        { name: 'Equatorial Guinea', id: 'GQ' },
        { name: 'Eritrea', id: 'ER' },
        { name: 'Estonia', id: 'EE' },
        { name: 'Ethiopia', id: 'ET' },
        { name: 'Falkland Islands (Malvinas)', id: 'FK' },
        { name: 'Faroe Islands', id: 'FO' },
        { name: 'Fiji', id: 'FJ' },
        { name: 'Finland', id: 'FI' },
        { name: 'France', id: 'FR' },
        { name: 'French Guiana', id: 'GF' },
        { name: 'French Polynesia', id: 'PF' },
        { name: 'French Southern Territories', id: 'TF' },
        { name: 'Gabon', id: 'GA' },
        { name: 'Gambia', id: 'GM' },
        { name: 'Georgia', id: 'GE' },
        { name: 'Germany', id: 'DE' },
        { name: 'Ghana', id: 'GH' },
        { name: 'Gibraltar', id: 'GI' },
        { name: 'Greece', id: 'GR' },
        { name: 'Greenland', id: 'GL' },
        { name: 'Grenada', id: 'GD' },
        { name: 'Guadeloupe', id: 'GP' },
        { name: 'Guam', id: 'GU' },
        { name: 'Guatemala', id: 'GT' },
        { name: 'Guernsey', id: 'GG' },
        { name: 'Guinea', id: 'GN' },
        { name: 'Guinea-Bissau', id: 'GW' },
        { name: 'Guyana', id: 'GY' },
        { name: 'Haiti', id: 'HT' },
        { name: 'Heard Island and Mcdonald Islands', id: 'HM' },
        { name: 'Holy See (Vatican City State)', id: 'VA' },
        { name: 'Honduras', id: 'HN' },
        { name: 'Hong Kong', id: 'HK' },
        { name: 'Hungary', id: 'HU' },
        { name: 'Iceland', id: 'IS' },
        { name: 'India', id: 'IN' },
        { name: 'Indonesia', id: 'ID' },
        { name: 'Iran, Islamic Republic Of', id: 'IR' },
        { name: 'Iraq', id: 'IQ' },
        { name: 'Ireland', id: 'IE' },
        { name: 'Isle of Man', id: 'IM' },
        { name: 'Israel', id: 'IL' },
        { name: 'Italy', id: 'IT' },
        { name: 'Jamaica', id: 'JM' },
        { name: 'Japan', id: 'JP' },
        { name: 'Jersey', id: 'JE' },
        { name: 'Jordan', id: 'JO' },
        { name: 'Kazakhstan', id: 'KZ' },
        { name: 'Kenya', id: 'KE' },
        { name: 'Kiribati', id: 'KI' },
        { name: 'Korea, Democratic People\'S Republic of', id: 'KP' },
        { name: 'Korea, Republic of', id: 'KR' },
        { name: 'Kuwait', id: 'KW' },
        { name: 'Kyrgyzstan', id: 'KG' },
        { name: 'Lao People\'S Democratic Republic', id: 'LA' },
        { name: 'Latvia', id: 'LV' },
        { name: 'Lebanon', id: 'LB' },
        { name: 'Lesotho', id: 'LS' },
        { name: 'Liberia', id: 'LR' },
        { name: 'Libyan Arab Jamahiriya', id: 'LY' },
        { name: 'Liechtenstein', id: 'LI' },
        { name: 'Lithuania', id: 'LT' },
        { name: 'Luxembourg', id: 'LU' },
        { name: 'Macao', id: 'MO' },
        { name: 'Macedonia, The Former Yugoslav Republic of', id: 'MK' },
        { name: 'Madagascar', id: 'MG' },
        { name: 'Malawi', id: 'MW' },
        { name: 'Malaysia', id: 'MY' },
        { name: 'Maldives', id: 'MV' },
        { name: 'Mali', id: 'ML' },
        { name: 'Malta', id: 'MT' },
        { name: 'Marshall Islands', id: 'MH' },
        { name: 'Martinique', id: 'MQ' },
        { name: 'Mauritania', id: 'MR' },
        { name: 'Mauritius', id: 'MU' },
        { name: 'Mayotte', id: 'YT' },
        { name: 'Mexico', id: 'MX' },
        { name: 'Micronesia, Federated States of', id: 'FM' },
        { name: 'Moldova, Republic of', id: 'MD' },
        { name: 'Monaco', id: 'MC' },
        { name: 'Mongolia', id: 'MN' },
        { name: 'Montserrat', id: 'MS' },
        { name: 'Morocco', id: 'MA' },
        { name: 'Mozambique', id: 'MZ' },
        { name: 'Myanmar', id: 'MM' },
        { name: 'Namibia', id: 'NA' },
        { name: 'Nauru', id: 'NR' },
        { name: 'Nepal', id: 'NP' },
        { name: 'Netherlands', id: 'NL' },
        { name: 'Netherlands Antilles', id: 'AN' },
        { name: 'New Caledonia', id: 'NC' },
        { name: 'New Zealand', id: 'NZ' },
        { name: 'Nicaragua', id: 'NI' },
        { name: 'Niger', id: 'NE' },
        { name: 'Nigeria', id: 'NG' },
        { name: 'Niue', id: 'NU' },
        { name: 'Norfolk Island', id: 'NF' },
        { name: 'Northern Mariana Islands', id: 'MP' },
        { name: 'Norway', id: 'NO' },
        { name: 'Oman', id: 'OM' },
        { name: 'Pakistan', id: 'PK' },
        { name: 'Palau', id: 'PW' },
        { name: 'Palestinian Territory, Occupied', id: 'PS' },
        { name: 'Panama', id: 'PA' },
        { name: 'Papua New Guinea', id: 'PG' },
        { name: 'Paraguay', id: 'PY' },
        { name: 'Peru', id: 'PE' },
        { name: 'Philippines', id: 'PH' },
        { name: 'Pitcairn', id: 'PN' },
        { name: 'Poland', id: 'PL' },
        { name: 'Portugal', id: 'PT' },
        { name: 'Puerto Rico', id: 'PR' },
        { name: 'Qatar', id: 'QA' },
        { name: 'Reunion', id: 'RE' },
        { name: 'Romania', id: 'RO' },
        { name: 'Russian Federation', id: 'RU' },
        { name: 'RWANDA', id: 'RW' },
        { name: 'Saint Helena', id: 'SH' },
        { name: 'Saint Kitts and Nevis', id: 'KN' },
        { name: 'Saint Lucia', id: 'LC' },
        { name: 'Saint Pierre and Miquelon', id: 'PM' },
        { name: 'Saint Vincent and the Grenadines', id: 'VC' },
        { name: 'Samoa', id: 'WS' },
        { name: 'San Marino', id: 'SM' },
        { name: 'Sao Tome and Principe', id: 'ST' },
        { name: 'Saudi Arabia', id: 'SA' },
        { name: 'Senegal', id: 'SN' },
        { name: 'Serbia and Montenegro', id: 'CS' },
        { name: 'Seychelles', id: 'SC' },
        { name: 'Sierra Leone', id: 'SL' },
        { name: 'Singapore', id: 'SG' },
        { name: 'Slovakia', id: 'SK' },
        { name: 'Slovenia', id: 'SI' },
        { name: 'Solomon Islands', id: 'SB' },
        { name: 'Somalia', id: 'SO' },
        { name: 'South Africa', id: 'ZA' },
        { name: 'South Georgia and the South Sandwich Islands', id: 'GS' },
        { name: 'Spain', id: 'ES' },
        { name: 'Sri Lanka', id: 'LK' },
        { name: 'Sudan', id: 'SD' },
        { name: 'Suriname', id: 'SR' },
        { name: 'Svalbard and Jan Mayen', id: 'SJ' },
        { name: 'Swaziland', id: 'SZ' },
        { name: 'Sweden', id: 'SE' },
        { name: 'Switzerland', id: 'CH' },
        { name: 'Syrian Arab Republic', id: 'SY' },
        { name: 'Taiwan, Province of China', id: 'TW' },
        { name: 'Tajikistan', id: 'TJ' },
        { name: 'Tanzania, United Republic of', id: 'TZ' },
        { name: 'Thailand', id: 'TH' },
        { name: 'Timor-Leste', id: 'TL' },
        { name: 'Togo', id: 'TG' },
        { name: 'Tokelau', id: 'TK' },
        { name: 'Tonga', id: 'TO' },
        { name: 'Trinidad and Tobago', id: 'TT' },
        { name: 'Tunisia', id: 'TN' },
        { name: 'Turkey', id: 'TR' },
        { name: 'Turkmenistan', id: 'TM' },
        { name: 'Turks and Caicos Islands', id: 'TC' },
        { name: 'Tuvalu', id: 'TV' },
        { name: 'Uganda', id: 'UG' },
        { name: 'Ukraine', id: 'UA' },
        { name: 'United Arab Emirates', id: 'AE' },
        { name: 'United Kingdom', id: 'GB' },
        { name: 'United States', id: 'US' },
        { name: 'United States Minor Outlying Islands', id: 'UM' },
        { name: 'Uruguay', id: 'UY' },
        { name: 'Uzbekistan', id: 'UZ' },
        { name: 'Vanuatu', id: 'VU' },
        { name: 'Venezuela', id: 'VE' },
        { name: 'Viet Nam', id: 'VN' },
        { name: 'Virgin Islands, British', id: 'VG' },
        { name: 'Virgin Islands, U.S.', id: 'VI' },
        { name: 'Wallis and Futuna', id: 'WF' },
        { name: 'Western Sahara', id: 'EH' },
        { name: 'Yemen', id: 'YE' },
        { name: 'Zambia', id: 'ZM' },
        { name: 'Zimbabwe', id: 'ZW' }
      ];
    }
  }
})();
