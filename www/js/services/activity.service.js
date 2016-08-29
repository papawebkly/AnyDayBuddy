(function() {
  'use strict';

  angular
    .module('adbionic')
    .factory('ActivityService', ActivityService);

  ActivityService.$inject = ['BaseApiUrl', '_', 'moment', '$http', '$q', '$rootScope'];

  function ActivityService(BaseApiUrl, _, moment, $http, $q, $rootScope) {
    var service = {
      categories: [],
      searches: [],
      invites: [],
      data: {
        activities: [],
        participants: []
      },
      date: {},

      getSearchesInvited: getSearchesInvited,
      acceptInvitation: acceptInvitation,
      populateCategory: populateCategory,
      rejectInvitation: rejectInvitation,
      calendarEvents: calendarEvents,
      getCategories: getCategories,
      getSearches: getSearches,
      acceptRequest: acceptRequest,
      rejectRequest: rejectRequest,
      mapMarkers: mapMarkers,
      vibeFilter: vibeFilter,
      getEvents: getEvents,
      clearData: clearData,
      setUpdate: setUpdate,
      getDetail: getDetail,
      search: search,
      update: update,
      remove: remove,
      invite: invite,
      marker: marker,
      join: join,
      kick: kick,
      vibe: vibe,
      getIcon:getIcon
    };

    return service;

    function search(params) {
      var deferred = $q.defer();

      $http.post(BaseApiUrl + '/activity/', formatted(params))
        .success(function(data, status, headers, config) {
          populateActivities(data);
          populateRequesters(data);
          addSearches(data.activity);
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function update(params) {
      var deferred = $q.defer();

      $http.put(BaseApiUrl + '/activity/', formatted(params))
        .success(function(data, status, headers, config) {
          getSearches({});
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    function remove(activity) {
      var deferred = $q.defer();

      $http.delete(BaseApiUrl + '/activity/' + activity)
        .success(function(data) {
          getSearches();
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    function vibe(params) {
      console.log("/activity/vibe/3");
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/activity/vibe/', { params: params })
        .success(function(data) {
          populateActivities(data);
          populateRequesters(data);
          addSearches(data.activity);
          data.location = params;
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    function invite(payload) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/activity/invite/', payload)
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function kick(payload) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/activity/kick/', payload)
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }


      function acceptRequest(payload) {
        var deferred = $q.defer();
        $http.post(BaseApiUrl + '/activity/acceptRequest/', payload)
          .success(function(data) {
            deferred.resolve(data);
          })
          .error(function(err) {
            deferred.reject(err);
          });
        return deferred.promise;
      }

      function rejectRequest(payload) {
        var deferred = $q.defer();
        $http.post(BaseApiUrl + '/activity/rejectRequest/', payload)
          .success(function(data) {
            deferred.resolve(data);
          })
          .error(function(err) {
            deferred.reject(err);
          });
        return deferred.promise;
      }


    function join(activity) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/activity/join/', {
        activity: activity
      })
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getEvents(params) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/activity/daily/', params)
        .success(function(resp) {
          deferred.resolve(resp);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getCategories(parent) {
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/category/' + parent + '?all=true')
        .success(function(resp) {
          deferred.resolve(resp);
          angular.copy(resp.subcategories, service.categories);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getSearchesInvited() {
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/user/activities/invited/')
        .success(function(resp) {
          deferred.resolve(resp);
          angular.copy(resp, service.invites);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getSearches(params) {
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/user/activities/', { params: params })
        .success(function(resp) {
          deferred.resolve(resp);
          angular.copy(resp.activities, service.searches);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getDetail(activityId) {
      var deferred = $q.defer();
      $http.get(BaseApiUrl + '/activity/view/' + activityId)
        .success(function(resp) {
          deferred.resolve(resp);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function vibeFilter(params) {
      console.log("/activity/vibe/4");
        var deferred = $q.defer();
      $http.get(BaseApiUrl + '/activity/vibe/', { params: params })
        .success(function(data) {
          populateActivities(data);
          populateRequesters(data);
          addSearches(data.activity);
          data.location = params;
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    function mapMarkers(users, locations) {
      var groups = [];
      var index = 0;

      for (var key in locations) {
        groups.push({
          id: index++,
          users: users,
          activities: locations[key],
          location: {
            latitude: locations[key][0].location[0],
            longitude: locations[key][0].location[1]
          },
          icon: getIcon(locations[key][0].category) //locations[key][0].name.isService ? marker('blue', 1) : marker('red', 1)
        });
      }

      return groups;
    }

    function getIcon(category) {
      if (category == 'social')
        return 'img/dark-tiny-social.png';
      if (category == 'handy')
        return 'img/dark-tiny-handy.png';
      if (category == 'active')
        return 'img/dark-tiny-active.png';
    }

    function addSearches(searches) {
      if (!searches) return;

      angular.copy(searches.concat(service.searches), service.searches);
    }

    function populateRequesters(data) {
      for (var key in data.groupByLocation) {
        populateUser(data.users, data.groupByLocation[key]);
      }
    }

    function populateUser(users, activities) {
      if (!activities || !users) return;

      for (var i = activities.length - 1; i >= 0; --i) {
        activities[i].requester = users[activities[i].requester];
      }

      return activities;
    }

    function populateActivities(data) {
      for (var key in data.groupByLocation) {
        populateCategory(data.categories, data.groupByLocation[key]);
      }
      populateCategory(data.categories, data.activity);
    }

    function populateCategory(categories, activities) {
      if (!activities || !categories) return;

      for (var i = activities.length - 1; i >= 0; --i) {
        activities[i].name = categories[activities[i].name];
      }

      return activities;
    }

    function populateParticipants() {

    }

    function clearData() {
      service.data = {
        activities: [],
        participants: []
      };
    }

    function formatted(data) {
      data.requester = $rootScope.user.id;
      data.startDate = moment(data.startDate).format();
      data.endDate = data.endDate == -1 ? -1 : moment(data.endDate).format();

      return data;
    }

    function setUpdate(data) {
      data = JSON.parse(JSON.stringify(data));
      data.create = false;
      data.existing = true;
      data.activities = [data.name];
      data.participants = data.participants ? data.participants : [];
      delete data.name;
      angular.copy(data, service.data);
    }

    function calendarEvents(categories, events) {
      var formattedEvents = [];

      angular.forEach(events, function(o) {
        var dayEvents = _.filter(o.events, { 'archived': false });

        if (dayEvents.length)
          formattedEvents.push({
            title: dayEvents.length,
            start: moment(o.date, 'YYYY-MM-DD').toDate(),
            end: moment('2016-06-07', 'YYYY-MM-DD').toDate(),
            events: populateCategory(categories, dayEvents),
            allDay: true,
            className: eventClass(dayEvents)
          });
      });

      return formattedEvents;
    }

    function eventClass(events) {
      var invited = _.filter(events, { status: 'accepted' });

      if (!invited.length) return 'normal-event';
      if (invited.length == events.length) return 'invited-event';

      return 'mixed-event';
    }

    function rejectInvitation(data) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/activity/reject/', {
          activity: data.activity
        })
        .success(function(resp) {
          deferred.resolve(resp);
          //angular.copy(resp.activities, service.searches);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function acceptInvitation(data) {
      var deferred = $q.defer();
      $http.post(BaseApiUrl + '/activity/accept/', {
          activity: data.activity
        })
        .success(function(resp) {
          deferred.resolve(resp);
          angular.copy(resp.activities, service.invites);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function marker(color, scale) {
      var icon = 'spotlight-poi.png';
      var base = 'http://mt.googleapis.com/vt/icon/name=icons/spotlight/';

      if (color == 'blue') icon = 'spotlight-waypoint-blue.png';
      if (color == 'green') icon = 'spotlight-waypoint-a.png';

      return base + icon + '&scale=' + scale;
    }

  }
})();
