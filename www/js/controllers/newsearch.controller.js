angular.module('adbionic')
  .controller('NewSearchCtrl', function($scope, $rootScope, $q, $ionicPlatform, $cordovaImagePicker,
    ImageUploadFactory, ActivityService, UtilService, uiGmapGoogleMapApi, uiGmapIsReady) {
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
    $scope.new_search = {};
    $scope.new_search.participants = [];
    $scope.new_search.imageGallery = [];
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

  })
