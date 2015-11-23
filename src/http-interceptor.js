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
});
