app
  .factory('$preferences', ['$store', function($store) {
    var pref = $store.get('preferences') || {};
    return new Proxy(pref, {
      get: function(target, name) {
        return target[name];
      },
      set: function(target, name, value) {
        if (target[name] !== value) {
          target[name] = value;
          $store.set('preferences', target);
        }
        return true;
      }
    });
  }]);