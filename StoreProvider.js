(function() {
    'use strict';

    angular.module('store.module', [])
        .provider('Store', function() {
            this.$get = [function() {
                return new Store();
            }];
        });
})();