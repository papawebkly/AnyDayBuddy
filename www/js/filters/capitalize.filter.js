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
