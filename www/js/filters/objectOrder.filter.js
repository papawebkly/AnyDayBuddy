/**
 * @ngdoc filter
 * @name objectOrder
 * @description 
 * 
 * Capitalizes the given string.
 * 
 */
(function() {
  'use strict';

  angular
    .module('adbionic')
    .filter('objectOrder', objectOrderFilter);

  function objectOrderFilter() {
    return objectOrder;

    ////////////////

    function objectOrder(items, field, reverse) {

      function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }

      var filtered = [];

      angular.forEach(items, function(item, key) {
        item.key = key;
        filtered.push(item);
      });

      function index(obj, i) {
        return obj[i];
      }

      filtered.sort(function(a, b) {
        var comparator;
        var reducedA = field.split('.').reduce(index, a);
        var reducedB = field.split('.').reduce(index, b);

        if (isNumeric(reducedA) && isNumeric(reducedB)) {
          reducedA = Number(reducedA);
          reducedB = Number(reducedB);
        }

        if (reducedA === reducedB) {
          comparator = 0;
        } else {
          comparator = reducedA > reducedB ? 1 : -1;
        }

        return comparator;
      });

      if (reverse) {
        filtered.reverse();
      }

      return filtered;
    };
  }

})();
