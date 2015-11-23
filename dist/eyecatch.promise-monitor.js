/*
 * eyecatch.promise-monitor - v1.0.0
 * file: promise-monitor.js
 */

(function () {
    angular.module('eyecatch.promise-monitor', []).provider('promiseMonitor', function () {
        this.$get = ['$q', function ($q) {
            function promiseMonitor(options) {
                var monitored = [];
                var self = this;

                // Set default options if necessary
                self.options = options || {};
                self.active = false;

                var updateActive = function() {
                    self.active = monitored.length > 0;
                };

                self.addPromise = function(promise) {
                    var deferred = $q.defer();
                    monitored.push(deferred);

                    deferred.promise.then(function() {
                        monitored.splice(monitored.indexOf(deferred), 1);

                        updateActive();
                    }, function() {
                        monitored.splice(monitored.indexOf(deferred), 1);

                        updateActive();
                    });

                    // Resolve deferred when promise has completed
                    if (promise) {
                        promise.then(function (value) {
                            deferred.resolve(value);

                            return value;
                        }, function (value) {
                            deferred.reject(value);

                            return $q.reject(value);
                        });
                    }

                    return deferred;
                };

                self.destroy = self.cancel = function () {
                    // Resolve all promises
                    for (var i = monitored.length - 1; i >= 0; i--) {
                        monitored[i].resolve();
                    }

                    // Reset monitored list
                    monitored = [];
                };
            }

            return {
                create: function(options) {
                    return new promiseMonitor(options);
                }
            };
        }];
    });
})();

/*
 * eyecatch.promise-monitor - v1.0.0
 * file: http-interceptor.js
 */

 (function () {
    angular.module('eyecatch.promise-monitor', []).factory('monitorInjector', ['$q', function($q) {
        var monitorRequest = {
            request: function(config) {
                // TODO: handle cached responses
               if (config.monitor) {
                   // Convert to array to simplify handling
                   if (!angular.isArray(config.monitor)) {
                       config.monitor = [config.monitor];
                   }

                   config.$promiseMonitorDeferred = config.$promiseMonitorDeferred || [];

                   // Create promises for each monitor
                   angular.forEach(config.monitor, function (monitor) {
                       config.$promiseMonitorDeferred.push(monitor.addPromise());
                   });
               }

               return $q.when(config);
            },
            response: function (response) {
               // TODO: handle cached responses
               if (response.config && response.config.$promiseMonitorDeferred) {
                   angular.forEach(response.config.$promiseMonitorDeferred, function (deferred) {
                       deferred.resolve(response);
                   });
               }

               return $q.when(response);
            },
            responseError: function (response) {
               // TODO: handle cached responses
                if (response.config && response.config.$promiseMonitorDeferred) {
                    angular.forEach(response.config.$promiseMonitorDeferred, function (deferred) {
                        deferred.reject(response);
                    });
                }

                return $q.reject(response);
            }
       };

       return monitorRequest;
    }]);

    angular.module('eyecatch.promise-monitor', []).config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('monitorInjector');
    }]);
})();
