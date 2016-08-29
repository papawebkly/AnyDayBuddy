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
