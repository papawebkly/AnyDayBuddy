angular.module('adbionic')

.controller('SignUpCtrl', function($scope, $state, $rootScope, $ionicModal, $auth, $cordovaImagePicker,
ImageUploadFactory, Auth, UserService, UtilService, ActivityService) {
	console.log('SignUp');
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
    // Basic Sign Up
	$scope.signAttempt = function() {
        $scope.loading = true;
        Auth.register($scope.data).then(function(resp) {
            $rootScope.userEmail = resp.user.email;
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
        $scope.loading = true;
        $scope.data.completedSignup = true;
        $scope.data.country = $scope.data.country.name;
        $state.go('app.dashboard');
    };

    $scope.choosePicture = function() {
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
                    $scope.data.profileImage = resp.url;
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
});
