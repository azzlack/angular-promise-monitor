(function () {
    angular.module('eyecatch.promise-monitor').config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push(['$q', function($q) {
            return {
                request: function (config) {
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
        }]);
    }]);
})();
