/**
 * @ngdoc filter
 * @name empty
 * @description 
 * 
 * Check if a given object is empty.
 * 
 */
(function() {
  'use strict';

  angular
    .module('adbionic')
    .filter('empty', emptyFilter);

    emptyFilter.$inject = ['_'];

  function emptyFilter(_) {
    return empty;

    ////////////////

    function empty(object) {
      return _.isEmpty(object);
    }
  }

})();
