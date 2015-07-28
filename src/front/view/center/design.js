app
  .directive('designArea', [function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<canvas class="design-area"></canvas>'
    }
  }]);