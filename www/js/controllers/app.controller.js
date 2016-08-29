angular.module('adbionic')

.controller('AppCtrl', function($scope, $state, $rootScope, $ionicModal, $ionicPlatform, $timeout, $ionicPopover,
  SocketService, Auth, UtilService, NotificationService,
  ActivityService, ConversationsService, FriendshipService, UserService) {
  console.log('App');
  $scope.buddies = FriendshipService.buddies;
  $scope.notifications = NotificationService.list;
  $scope.conversations = ConversationsService.conversations;
  $scope.activity = {};
  $scope.step = 1;
  $scope.filter = ''
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
      getCategories();
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

});
