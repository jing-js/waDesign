app
  .factory('$store', [function() {
    return {
      get: function(key) {
        return JSON.parse(localStorage.getItem(key) || "null");
      },
      set: function(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
  }]);