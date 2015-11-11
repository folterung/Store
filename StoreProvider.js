(function() {
    'use strict';

    angular.module('store.module', [])
        .provider('Store', [function() {
            var put = Store.prototype.put;
            var get = Store.prototype.get;
            var remove = Store.prototype.remove;
            var api = {};
            var baseUrl = '';
            var METHODS = {
                PUT: 'PUT',
                POST: 'POST',
                GET: 'GET',
                REMOVE: 'DELETE'
            };

            this.set = set;
            this.setBaseUrl = setBaseUrl;
            this.$get = ['$http', '$q', function($http, $q) {
                function StoreService() {}

                StoreService.prototype = Store.prototype;
                StoreService.prototype.put = putOverload;
                StoreService.prototype.post = post;
                StoreService.prototype.get = getOverload;
                StoreService.prototype.remove = removeOverload;
                StoreService.prototype.set = set;
                StoreService.prototype.wipe = empty;
                StoreService.prototype.setBaseUrl = setBaseUrl;

                return StoreService;

                function putOverload(keys, value, config) {
                    var context = this,
                        apiInfo = _get(keys, METHODS.PUT);

                    if(apiInfo && apiInfo.url) {
                        var defer = $q.defer();

                        _makeRequest(apiInfo, value, config).then(function onSuccess(response) {
                            if(apiInfo.store) { put.call(context, keys, value); }
                            defer.resolve(response.data);
                        }, function onError(error) {
                            defer.reject(error);
                        });

                        return defer.promise;
                    } else {
                        return put.call(context, keys, value);
                    }
                }

                function post(keys, value, config) {
                    var context = this,
                        apiInfo = _get(keys, METHODS.POST);

                    if(apiInfo && apiInfo.url) {
                        var defer = $q.defer();

                        _makeRequest(apiInfo, value, config).then(function onSuccess(response) {
                            if(apiInfo.store) { put.call(context, keys, response.data); }
                            defer.resolve(response.data);
                        }, function onError(error) {
                            defer.reject(error);
                        });

                        return defer.promise;
                    } else {
                        return put.call(context, keys, value);
                    }
                }

                function getOverload(keys, config) {
                    var context = this,
                        apiInfo = _get(keys, METHODS.GET);

                    if(apiInfo && apiInfo.url) {
                        var defer = $q.defer();

                        _makeRequest(apiInfo, false, config).then(function onSuccess(response) {
                            if(apiInfo.store) { put.call(context, keys, response.data); }
                            defer.resolve(response.data);
                        }, function onError(error) {
                            defer.reject(error);
                        });

                        return defer.promise;
                    } else {
                        return get.call(context, keys);
                    }
                }

                function removeOverload(keys, config) {
                    var context = this,
                        apiInfo = _get(keys, METHODS.REMOVE);

                    if(apiInfo && apiInfo.url) {
                        var defer = $q.defer();

                        _makeRequest(apiInfo, false, config).then(function onSuccess(response) {
                            if(apiInfo.store) { remove.call(context, keys); }
                            defer.resolve(response);
                        },function onError(error) {
                            defer.reject(error);
                        });

                        return defer.promise;
                    } else {
                        return remove.call(context, keys);
                    }
                }

                function empty() {
                    var context = this;

                    for(var prop in context) {
                        delete context[prop];
                    }
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

            function set(mapKey, config) {
                var saveKey = '';

                if(_isUndefined(config) || _isUndefined(config.method)) {
                    for(var method in METHODS) {
                        var saveConfig = {};
                        var methodName = METHODS[method].toLowerCase();

                        saveKey = mapKey + '.' + methodName;
                        saveConfig.method = methodName;

                        if(_isUndefined(config) || _isUndefined(config.url)) {
                            saveConfig.store = true;
                        } else {
                            saveConfig.url = _buildUrl(config.url);
                            saveConfig.headers = config.headers;
                            saveConfig.store = config.store;
                        }

                        put.call(api, saveKey, saveConfig);
                    }
                } else {
                    saveKey = mapKey + '.' + config.method.toLowerCase();

                    put.call(api, saveKey, {
                        url: _buildUrl(config.url),
                        method: config.method.toLowerCase(),
                        headers: config.headers,
                        store: config.store
                    });
                }
            }

            function setBaseUrl(newBaseUrl) {
                baseUrl = newBaseUrl;
            }

            function _get(key, method) {
                var getKey = key + '.' + method.toLowerCase();

                return get.call(api, getKey);
            }

            function _buildUrl(url) {
                return (url.charAt(0) === '/') ? (baseUrl + url) : url;
            }

            function _isUndefined(value) {
                return value === undefined;
            }
        }]);
})();
