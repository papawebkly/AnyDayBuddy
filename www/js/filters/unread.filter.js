(function() {
  'use strict';

  angular
    .module('adbionic')
    .filter('unread', unreadFilter);

  unreadFilter.$inject = ['$rootScope'];

  function unreadFilter($rootScope) {
    return unread;

    ////////////////

    function unread(c) {
      var unread = [];

      for (var i = c.length - 1; i >= 0; --i) {
        if (!c[i].hasOwnProperty('messages') || !c[i].messages.length) continue;

        if (c[i].messages[c[i].messages.length - 1].status != 'read')
          unread.push(c[i]);
      }

      return unread;
    }
  }

})();
