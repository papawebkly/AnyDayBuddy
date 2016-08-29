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