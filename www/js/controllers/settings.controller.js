angular.module('adbionic')
  .controller('SettingsCtrl', function($scope, $rootScope, $ionicPlatform, $cordovaImagePicker, ImageUploadFactory,
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
  })
