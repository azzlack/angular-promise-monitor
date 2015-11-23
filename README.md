# angular-promise-monitor
Tiny and fast library for monitoring promises in `angular` applications. Inspired by [angular-promise-tracker](https://github.com/ajoslin/angular-promise-tracker), but with faster GUI updates and smaller footprint.

## How to use
HTML:
```html
<body ng-app="myApp" ng-controller="MyController">
  <i class="fa fa-spinner fa-spin" ng-show="getDataMonitor.isActive"></i>

  <script src="angular.js"></script>
  <script src="eyecatch.promise-monitor.js"></script>
</body>
```
JS:
```js
angular.module('myApp', ['eyecatch.promise-monitor'])

.controller('MyController', ['$scope', '$http', '$timeout', 'promiseMonitor', function($scope, $http, $timeout, promiseMonitor) {
  $scope.getDataMonitor = promiseMonitor.create();
  
  var getData = function() {
    var promise = $timeout(function() {
      console.log('Got data');
    }, 1000);
    
    $scope.getDataMonitor.addPromise(promise);
  };
  
  getData();
}]);
```

## Advanced usage
### Multiple promises
The `addPromise` function can be called multiple times, the `isActive` property will be `true` until all promises are resolved or rejected.
```js
$scope.getDataMonitor = promiseMonitor.create();
  
var getData = function() {
  var promise1 = $timeout(function() {
    console.log('Got data from first source');
  }, 1000);
  var promise2 = $timeout(function() {
    console.log('Got data from second source');
  }, 1500);
  
  $scope.getDataMonitor.addPromise(promise1);
  $scope.getDataMonitor.addPromise(promise2);
};

getData();
```

### Monitoring $http calls
You can monitor `$http` calls by adding an instance of a promise monitor in the options object.

```js
$scope.getDataMonitor = promiseMonitor.create();
  
var getData = function() {
  return $http.get('/data', {
      monitor: $scope.getDataMonitor
    }).then(function(response) {
      console.log('Got data');
    });
};

getData();
```

### Manual resolving

```js
$scope.getDataMonitor = promiseMonitor.create();
  
var getData = function() {
  var promise = $scope.getDataMonitor.addPromise();
  $http.get('/data').then(function(response) {
      promise.resolve();
    });
};

getData();
```

## Reference
### `promiseMonitor` (service)
Methods:

Name | Returns | Description
:------------- | ------------ | -------------
`create` | An instance of `PromiseMonitor` | Creates a new instance

### `PromiseMonitor` (class)
Methods:

Name | Returns | Description
:------------- | ------------- | -------------
`addPromise` | An instance of deferred | Takes a promise as an argument and updates the `isActive` property when it is resolved. Can be called multiple times, the `isActive` property will then be updated when all promises are resolved. Can also be called without any parameters, the `isActive` property will then be updated when the returned deferred is resolved.
`destroy` | | Resolves all promises at once and sets the `isActive` property to `false`
`cancel` | | Same as `destroy`

Properties:

Name | Returns | Description
:------------- | ------------- | -------------
`isActive` | A boolean value | Indicates whether this instance has any active promises
`options` | An object | The options that were used when creating the `PromiseMonitor` instance. **Currently not in use**.
