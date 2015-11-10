(function() {
    'use strict';

    angular.module('store.module', [])
        .provider('Store', [function() {
            var put = Store.prototype.put;
            var get = Store.prototype.get;
            var remove = Store.prototype.remove;
            var api = {};
            var METHODS = {
                PUT: 'PUT',
                POST: 'POST',
                GET: 'GET',
                REMOVE: 'DELETE'
            };

            this.setApi = setApi;
            this.$get = ['$http', '$q', function($http, $q) {
                function StoreService() {}

                StoreService.prototype = Store.prototype;
                StoreService.prototype.put = putOverload;
                StoreService.prototype.post = post;
                StoreService.prototype.get = getOverload;
                StoreService.prototype.remove = removeOverload;
                StoreService.prototype.setApi = setApi;

                return StoreService;

                function putOverload(keys, value, includeServer, config) {
                    var context = this,
                        defer = $q.defer(),
                        apiInfo = (includeServer === true) ? _getApi(keys, METHODS.PUT) : false;

                    if(apiInfo) {
                        _makeRequest(apiInfo, value, config).then(function onSuccess(response) {
                            put.call(context, keys, value);
                            defer.resolve(response.data);
                        }, function onError(error) {
                            defer.reject(error);
                        });

                    } else {
                        put.call(context, keys, value);
                        defer.resolve(get.call(context, keys));
                    }

                    return defer.promise;
                }

                function post(keys, value, includeServer, config) {
                    var context = this,
                        defer = $q.defer(),
                        apiInfo = (includeServer === true) ? _getApi(keys, METHODS.POST) : false;

                    if(apiInfo) {
                        _makeRequest(apiInfo, value, config).then(function onSuccess(response) {
                            put.call(context, keys, response.data);
                            defer.resolve(response.data);
                        }, function onError(error) {
                            defer.reject(error);
                        });

                    } else {
                        put.call(context, keys, value);
                        defer.resolve(get.call(context, keys));
                    }

                    return defer.promise;
                }

                function getOverload(keys, includeServer, config) {
                    var context = this,
                        defer = $q.defer(),
                        apiInfo = (includeServer === true) ? _getApi(keys, METHODS.GET) : false;

                    if(apiInfo) {
                        _makeRequest(apiInfo, false, config).then(function onSuccess(response) {
                            put.call(context, keys, response.data);
                            defer.resolve(response.data);
                        }, function onError(error) {
                            defer.reject(error);
                        });
                    } else {
                        defer.resolve(get.call(context, keys));
                    }

                    return defer.promise;
                }

                function removeOverload(keys, includeServer, config) {
                    var context = this,
                        defer = $q.defer(),
                        apiInfo = (includeServer === true) ? _getApi(keys, METHODS.REMOVE) : false;

                    if(apiInfo) {
                        _makeRequest(apiInfo, false, config).then(function onSuccess(response) {
                            remove.call(context, keys);
                            defer.resolve(response);
                        },function onError(error) {
                            defer.reject(error);
                        });

                    } else {
                        remove.call(context, keys);
                        defer.resolve(context);
                    }

                    return defer.promise;
                }

                function _makeRequest(api, value, config) {
                    var httpConfig = {
                            headers: api.headers
                        },
                        httpArgs = [];

                    httpArgs.push(_substituteParams(api, config));
                    if(value) { httpArgs.push(value); }
                    httpArgs.push(httpConfig);

                    return $http[api.method.toLowerCase()].apply(this, httpArgs);
                }

                function _substituteParams(api, params) {
                    var tempUrl = api.url;

                    for(var prop in params) {
                        tempUrl = _replaceParams(tempUrl, prop, params[prop]);
                    }

                    return tempUrl;

                    function _replaceParams(str, param, value) {
                        var matchString = '\\{'+param+'\\}';
                        var regex = new RegExp(matchString, 'g');

                        str = str.replace(regex, value);

                        return str;
                    }
                }
            }];

            function setApi(keys, url, method, headers) {
                var saveKey = '';

                if(typeof method !== 'string' && headers === undefined) {
                    if(method && headers === undefined) { headers = method; }

                    for(var method in METHODS) {
                        saveKey = keys + '.' + METHODS[method].toLowerCase();

                        put.call(api, saveKey, {
                            url: url,
                            method: METHODS[method],
                            headers: headers
                        });
                    }
                } else {
                    saveKey = keys + '.' + method.toLowerCase();

                    put.call(api, saveKey, {
                        url: url,
                        method: method.toLowerCase(),
                        headers: headers
                    });
                }
            }

            function _getApi(key, method) {
                var getKey = key + '.' + method.toLowerCase();

                return get.call(api, getKey);
            }
        }]);
})();