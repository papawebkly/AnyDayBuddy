(function() {
  'use strict';

  angular
    .module('adbionic')
    .filter('message', messageFilter);

  messageFilter.$inject = ['isActivityFilter'];

  function messageFilter(isActivityFilter) {
    return message;

    ////////////////

    function message(string) {
      if (isUrl(string)) return 'Photo';
      if (isActivityFilter(string)) return 'Activity';
      return string;
    }

    function isUrl(string) {
      var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
      return regex.test(string);
    }
  }

})();
