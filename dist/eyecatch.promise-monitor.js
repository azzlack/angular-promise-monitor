/**
 * eyecatch-promise-monitor - An Angular module for monitoring promises
 * @version v1.0.0
 * @author Ove Andersen <ove.andersen@outlook.com>
 * @link https://github.com/azzlack/angular-promise-monitor
 * @license Apache-2.0
 */
(function() {
    angular.module("eyecatch.promise-monitor", []).provider("promiseMonitor", function() {
        this.$get = [ "$q", function($q) {
            function PromiseMonitor(options) {
                var monitored = [];
                var self = this;
                self.options = options || {};
                self.isActive = false;
                var updateActive = function() {
                    self.isActive = monitored.length > 0;
                };
                self.addPromise = function(promise) {
                    var deferred = $q.defer();
                    monitored.push(deferred);
                    updateActive();
                    deferred.promise.then(function() {
                        monitored.splice(monitored.indexOf(deferred), 1);
                        updateActive();
                    }, function() {
                        monitored.splice(monitored.indexOf(deferred), 1);
                        updateActive();
                    });
                    if (promise) {
                        promise.then(function(value) {
                            deferred.resolve(value);
                            return value;
                        }, function(value) {
                            deferred.reject(value);
                            return $q.reject(value);
                        });
                    }
                    return deferred;
                };
                self.destroy = self.cancel = function() {
                    for (var i = monitored.length - 1; i >= 0; i--) {
                        monitored[i].resolve();
                    }
                    monitored = [];
                    updateActive();
                };
                return self;
            }
            return {
                create: function(options) {
                    return new PromiseMonitor(options);
                }
            };
        } ];
        return this;
    });
})();

(function() {
    angular.module("eyecatch.promise-monitor").config([ "$httpProvider", function($httpProvider) {
        $httpProvider.interceptors.push([ "$q", function($q) {
            return {
                request: function(config) {
                    if (config.monitor) {
                        if (!angular.isArray(config.monitor)) {
                            config.monitor = [ config.monitor ];
                        }
                        config.$promiseMonitorDeferred = config.$promiseMonitorDeferred || [];
                        angular.forEach(config.monitor, function(monitor) {
                            config.$promiseMonitorDeferred.push(monitor.addPromise());
                        });
                    }
                    return $q.when(config);
                },
                response: function(response) {
                    if (response.config && response.config.$promiseMonitorDeferred) {
                        angular.forEach(response.config.$promiseMonitorDeferred, function(deferred) {
                            deferred.resolve(response);
                        });
                    }
                    return $q.when(response);
                },
                responseError: function(response) {
                    if (response.config && response.config.$promiseMonitorDeferred) {
                        angular.forEach(response.config.$promiseMonitorDeferred, function(deferred) {
                            deferred.reject(response);
                        });
                    }
                    return $q.reject(response);
                }
            };
        } ]);
    } ]);
})();