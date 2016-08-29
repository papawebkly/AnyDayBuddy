if (window.cordova) {
  window.cordova.addStickyDocumentEventHandler('handleopenurl');
}

function handleOpenURL(url) {
  window.cordova.fireDocumentEvent('handleopenurl', { url: url });
}

if (window.io) {
	window.io.sails.autoConnect = false;
}
// angular.module('adbionic', ['ionic', 'ngCordova']);
angular.module('adbionic', ['ionic', 'ngCordova', 'uiGmapgoogle-maps', 'satellizer']);