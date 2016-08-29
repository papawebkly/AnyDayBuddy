angular.module('adbionic')
	.config(mapsProvider)
	.config(authProvider)

	mapsProvider.$inject = ['uiGmapGoogleMapApiProvider'];

	function mapsProvider(uiGmapGoogleMapApiProvider) {
	    uiGmapGoogleMapApiProvider.configure({
	      key: 'AIzaSyAwK51ikb7PENrz_eEBJ8mC1hwxsLWbDDQ',
	      libraries: 'places'
	    });
	}
	 
	authProvider.$inject = ['$authProvider', '$httpProvider'];

  	function authProvider($authProvider, $httpProvider) {
	    //Satellizer Settings
	    $authProvider.authHeader = 'Authorization';
	    $authProvider.authToken = 'Bearer';
	    $authProvider.token = 'token';
	    $authProvider.tokenPrefix = 'access';
	    $authProvider.storageType = 'localStorage';

	    $authProvider.facebook({
	      clientId: '1665816233706214',
	      name: 'facebook',
	      url: 'http://159.203.47.252:1338/auth/facebook',
	      authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth',
	      redirectUri: window.location.origin + '/',
	      requiredUrlParams: ['display', 'scope'],
	      scope: ['email'],
	      scopeDelimiter: ',',
	      display: 'popup',
	      type: '2.0',
	      popupOptions: {
	        width: 580,
	        height: 400
	      }
	    });

	    // Google
	    $authProvider.google({
	      url: 'http://159.203.47.252:1338/auth/google',
	      clientId: '1081734392317-3gh14vephi624rc7esoikas0p9coeukj.apps.googleusercontent.com',
	      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
	      redirectUri: window.location.origin,
	      requiredUrlParams: ['scope'],
	      optionalUrlParams: ['display'],
	      scope: ['profile', 'email'],
	      scopePrefix: 'openid',
	      scopeDelimiter: ' ',
	      display: 'popup',
	      type: '2.0',
	      popupOptions: {
	        width: 452,
	        height: 633
	      }
	    });

	    $httpProvider.interceptors.push('interceptorsService');
  	}

// 	.config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
//   GoogleMapApi.configure({
//     v: '3.17',
//     libraries: 'weather,geometry,visualization'
//   });
// }]);
// .config(function($httpProvider) {
//   $httpProvider.interceptors.push('authInterceptor');
//   $httpProvider.defaults.withCredentials = true;
// });
