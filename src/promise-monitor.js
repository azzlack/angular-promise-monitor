(function () {
    angular.module('eyecatch.promise-monitor', []).provider('promiseMonitor', function () {
        this.$get = ['$q', function ($q) {
            // ReSharper disable once InconsistentNaming
            function PromiseMonitor(options) {
                var monitored = [];
                var self = this;

                // Set default options if necessary
                self.options = options || {};
                self.isActive = false;

                var updateActive = function () {
                    self.isActive = monitored.length > 0;
                };

                self.addPromise = function (promise) {
                    var deferred = $q.defer();
                    monitored.push(deferred);

                    updateActive();

                    deferred.promise.then(function () {
                        monitored.splice(monitored.indexOf(deferred), 1);

                        updateActive();
                    }, function () {
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

                return self;
            }

            return {
                create: function (options) {
                    return new PromiseMonitor(options);
                }
            };
        }];

        return this;
    });
})();
