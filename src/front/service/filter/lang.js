app
  .filter('lang', ['locales', function(languages) {
    return function(loc) {
      return languages[loc];
    }
  }]);