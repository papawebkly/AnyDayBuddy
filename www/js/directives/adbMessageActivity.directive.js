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
