(function(win) {
    'use strict';

    function Store() {}

    Store.prototype.put = put;
    Store.prototype.get = get;
    Store.prototype.remove = remove;

    if(win.localStorage) {
        Store.prototype.save = save;
        Store.prototype.load = load;
        Store.prototype.clear = clear;
    }

    win.Store = Store;

    function put(keys, value) {
        if(value === undefined) {
            _state.call(this, keys);
        } else if(_isArray(keys) && _isArray(value)) {
            if(typeof keys === 'string') {
                keys = _flattenKeys(keys);
            }

            for(var i = 0; i < value.length; i++) {
                this.put(keys[i], value[i]);
            }
        } else {
            var keys = _flattenKeys(keys);
            _find.call(this, keys, true)[keys.slice(-1)] = value;
        }
    }

    function get(keys) {
        if(keys === undefined) { return this; }

        var keys = _flattenKeys(keys);
        var parentObj = _find.call(this, keys);

        if(parentObj === undefined) { return; }

        return parentObj[keys.slice(-1)];
    }

    function remove(keys) {
        var keys = _flattenKeys(keys);
        delete _find.call(this, keys)[keys.slice(-1)];
    }

    function save(saveKey) {
        win.localStorage.setItem(saveKey, JSON.stringify(this));
    }

    function load(saveKey) {
        var cachedData = JSON.parse(win.localStorage.getItem(saveKey));

        if(cachedData) {
            _state.call(this, cachedData);
            return this;
        }

        return undefined;
    }

    function clear(saveKey) {
        win.localStorage.removeItem(saveKey);
    }

    function _flattenKeys(keys) {
        if(typeof keys === 'string') {
            return keys.split('.');
        } else if(keys.length) {
            return keys;
        } else {
            return [keys];
        }
    }

    function _find(array, put) {
        var value = this;

        for(var i = 0; i < array.length; i++) {
            if(i+1 === array.length) { break; }

            if(put && value[array[i]] === undefined) {
                value[array[i]] = {};
            }

            value = value[array[i]];
        }

        return value;
    }

    function _state(obj) {
        for(var prop in obj) {
            this[prop] = obj[prop];
        }
    }

    function _isArray(value) {
        return (value.length && typeof value === 'object');
    }
})(window);