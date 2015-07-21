app.directive('waMain', ['Template', function(T) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: T['main']
  }
}]);