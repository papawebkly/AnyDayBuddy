(function() {
  'use strict';

  angular
    .module('adbionic')
    .filter('lastItem', lastItemFilter);

  lastItemFilter.$inject = ['_'];

  function lastItemFilter(_) {
    return lastItem;

    ////////////////

    function lastItem(array) {
      return _.isArray(array)?array[array.length - 1]:{};
    }
  }

})();
