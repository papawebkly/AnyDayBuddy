angular.module('adbionic')

.controller('SearchDetailCtrl', function($scope, $rootScope, $timeout, ActivityService, uiGmapGoogleMapApi, uiGmapIsReady) {
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
});