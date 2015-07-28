app
  .directive('contentCenter', ['Template', function(T) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: T['content-center']
    }
  }]);