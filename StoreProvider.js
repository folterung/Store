(function() {
    'use strict';

    angular.module('store.module', [])
        .provider('Store', [function() {
            var put = Store.prototype.put;
            var get = Store.prototype.get;
            var remove = Store.prototype.remove;
            var baseUrl = '';
            var METHODS = {
                PUT: 'PUT',
                POST: 'POST',
                GET: 'GET',
                REMOVE: 'DELETE'
            };
            var STORE_API_INFO = '$$storeApiInfo';

            this.setBaseUrl = setBaseUrl;
            this.$get = ['$http', '$q', function($http, $q) {
                var bindObject;

                function StoreService() {
                    this[STORE_API_INFO] = {};
                }

                StoreService.prototype = Store.prototype;
                StoreService.prototype.put = putOverload;
                StoreService.prototype.post = post;
                StoreService.prototype.get = getOverload;
                StoreService.prototype.remove = removeOverload;
                StoreService.prototype.set = set;
                StoreService.prototype.wipe = empty;
                StoreService.prototype.setBaseUrl = setBaseUrl;
                StoreService.prototype.setBind = setBind;
                StoreService.prototype.bind = bind;
                StoreService.prototype.api = {};

                return StoreService;

                function putOverload(keys, value, config, preventUpdate) {
                    var context = this,
                        apiInfo = _get.call(context, keys, METHODS.PUT);

                    if(apiInfo && apiInfo.url) {
                        var defer = $q.defer();

                        _makeRequest(apiInfo, value, config).then(function onSuccess(response) {
                            if(apiInfo.store && !preventUpdate) {
                                put.call(context, keys, value);
                                if(bindObject) { bind.call(context, bindObject); }
                            }

                            defer.resolve(response.data);
                        }, function onError(error) {
                            defer.reject(error);
                        });

                        return defer.promise;
                    } else {
                        return put.call(context, keys, value);
                    }
                }

                function post(keys, value, config, preventUpdate) {
                    var context = this,
                        apiInfo = _get.call(context, keys, METHODS.POST);

                    if(apiInfo && apiInfo.url) {
                        var defer = $q.defer();

                        _makeRequest(apiInfo, value, config).then(function onSuccess(response) {
                            if(apiInfo.store && !preventUpdate) {
                                put.call(context, keys, response.data);
                                if(bindObject) { bind.call(context, bindObject); }
                            }

                            defer.resolve(response.data);
                        }, function onError(error) {
                            defer.reject(error);
                        });

                        return defer.promise;
                    } else {
                        return put.call(context, keys, value);
                    }
                }

                function getOverload(keys, config, preventUpdate) {
                    var context = this,
                        apiInfo = _get.call(context, keys, METHODS.GET);

                    if(apiInfo && apiInfo.url) {
                        var defer = $q.defer();

                        _makeRequest(apiInfo, false, config).then(function onSuccess(response) {
                            if(apiInfo.store && !preventUpdate) {
                                put.call(context, keys, response.data);
                                if(bindObject) { bind.call(context, bindObject); }
                            }

                            defer.resolve(response.data);
                        }, function onError(error) {
                            defer.reject(error);
                        });

                        return defer.promise;
                    } else {
                        return get.call(context, keys);
                    }
                }

                function removeOverload(keys, config, preventUpdate) {
                    var context = this,
                        apiInfo = _get.call(context, keys, METHODS.REMOVE);

                    if(apiInfo && apiInfo.url) {
                        var defer = $q.defer();

                        _makeRequest(apiInfo, false, config).then(function onSuccess(response) {
                            if(apiInfo.store && !preventUpdate) {
                                remove.call(context, keys);
                                if(bindObject) { bind.call(context, bindObject); }
                            }

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

                function bind(obj, regEx, replaceMatch) {
                    var context = this;
                    var keys = Object.keys(context);
                    var key;
                    var saveKey;

                    if(_isUndefined(obj)) {
                        if(_isUndefined(bindObject)) { return; }

                        obj = bindObject;
                    }

                    for(var i = 0; i < keys.length; i++) {
                        key = keys[i];
                        saveKey = (replaceMatch === true) ? key.replace(regEx, '') : key;

                        if(saveKey.charAt(0) === '.') { saveKey = saveKey.substring(1); }

                        if(key !== STORE_API_INFO) {
                            if(regEx) {
                                if(regEx.exec(key)) {
                                    put.call(obj, saveKey, context[key]);
                                }
                            } else {
                                put.call(obj, saveKey, context[key]);
                            }
                        }
                    }

                    return obj;
                }

                function setBind(obj) {
                    bindObject = obj;
                }

                function set(mapKey, config) {
                    var context = this;
                    var saveKey = '';

                    if(typeof mapKey !== 'string') { config = mapKey; }

                    if(_isUndefined(config) || _isUndefined(config.method)) {
                        for(var method in METHODS) {
                            var saveConfig = {};
                            var methodName = METHODS[method].toLowerCase();

                            saveKey = _buildApiKey(mapKey, methodName);
                            saveConfig.method = methodName;

                            if(_isUndefined(config) || _isUndefined(config.url)) {
                                saveConfig.store = true;
                            } else {
                                saveConfig.url = _buildUrl(config.url);
                                saveConfig.headers = config.headers;
                                saveConfig.store = config.store;
                            }

                            put.call(context[STORE_API_INFO], saveKey, saveConfig);
                        }
                    } else {
                        saveKey = _buildApiKey(mapKey, config.method.toLowerCase());

                        put.call(context[STORE_API_INFO], saveKey, {
                            url: _buildUrl(config.url),
                            method: config.method.toLowerCase(),
                            headers: config.headers,
                            store: config.store
                        });
                    }
                }

                function _get(key, method) {
                    var context = this;
                    var getKey = _buildApiKey(key, method.toLowerCase());

                    return get.call(context[STORE_API_INFO], getKey);
                }

                function _buildApiKey(mapKey, method) {
                    return (!_isUndefined(mapKey) && _isString(mapKey)) ? (mapKey + '.' + method) : method;
                }

                function _buildUrl(url) {
                    return (url.charAt(0) === '/') ? (baseUrl + url) : url;
                }

                function _makeRequest(api, value, params) {
                    var httpConfig = {
                            headers: api.headers
                        },
                        httpArgs = [];

                    httpArgs.push(_substituteParams(api, params));
                    if(value) { httpArgs.push(value); }
                    httpArgs.push(httpConfig);

                    return $http[api.method].apply(this, httpArgs);
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

            function setBaseUrl(newBaseUrl) {
                baseUrl = newBaseUrl;
            }

            function _isUndefined(value) {
                return value === undefined;
            }

            function _isString(value) {
                return (typeof value === 'string');
            }
        }]);
})();
