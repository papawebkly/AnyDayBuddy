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
