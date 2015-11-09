(function(win) {
    'use strict';

    function Store() {}

    Store.prototype.put = put;
    Store.prototype.get = get;
    Store.prototype.remove = remove;

    win.Store = Store;

    function put(keys, value) {
        if(value === undefined) {
            _state.call(this, keys);
        } else if(value.length && typeof value === 'object') {
            var keys = _flattenKeys(keys);

            for(var i = 0; i < value.length; i++) {
                this.put(keys.slice(0, i+1), value[i]);
            }
        } else {
            var keys = _flattenKeys(keys);
            _find.call(this, keys, true)[keys.slice(-1)] = value;
        }
    }

    function get(keys) {
        if(keys === undefined) { return this; }

        var keys = _flattenKeys(keys);
        return _find.call(this, keys)[keys.slice(-1)];
    }

    function remove(keys) {
        var keys = _flattenKeys(keys);
        delete _find.call(this, keys)[keys.slice(-1)];
    }

    function _flattenKeys(keys) {
        if(typeof keys === 'string') {
            return keys.split('.');
        } else if(keys.length) {
            return keys;
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
})(window);