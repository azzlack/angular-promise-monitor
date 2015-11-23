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
