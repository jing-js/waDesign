'use strict';

app
  .factory('i18nService', ['R', function(R) {
    return function(msg) {
      let lm = R.t(msg);
      return lm ? lm : msg;
    }
  }]);

app
  .filter('t', ['i18nService', function(i18n) {
    return function(msg, prefix) {
      return i18n((prefix ? prefix + '.' : '') + msg);
    }
  }]);

app
  .directive('i18n', ['i18nService', function(i18n) {
  return {
    restrict: 'A',
    compile: function($element, $attr) {

      function parse(id) {
        let ids = id.split("#").map(it => it.trim());
        let txt = i18n(ids[0]);
        return ids.length > 1 ? txt.replace(/\$(\d+)/g, (m, n) => ids[parseInt(n)] || '') : txt;
      }

      if ($attr.i18n) {
        $element.text(parse($attr.i18n));
      }
      if ($attr.placeholder) {
        $element.attr('placeholder', parse($attr.placeholder));
      }
      if ($attr.value) {
        $element.val(parse($attr.value));
      }
      if ($element.text()) {
        $element.text(parse($element.text()));
      }
    }
  }
}]);

app
  .directive('ngLocaleIf', ['$config', function($config) {
    return {
      restrict: 'A',
      compile: function($ele, $attr) {
        let condition = $attr.ngLocaleIf;
        let not = condition[0] === '!';
        let loc = not ? condition.substring(1) : condition;
        if (not === ($config.locale === loc)) {
          $ele.remove();
        }
      }
    }
  }]);