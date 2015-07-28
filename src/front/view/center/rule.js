app
  .directive('waRule', [function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<canvas></canvas>',
      compile: function($ele, $attr) {
        $ele.addClass(`${$attr.pos || 'top'}-rule`);
      }
    };
  }]);