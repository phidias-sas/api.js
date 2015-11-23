/*
phidiasStorage.session.store('name', value);
phidiasStorage.session.retrieve('name', defaultValue);

phidiasStorage.local.store('name', value);
phidiasStorage.local.retrieve('name', defaultValue);

*/
(function() {
    'use strict';

    angular
        .module('phidias-api')
        .factory('phidiasStorage', phidiasStorage);

    function phidiasStorage() {

        return {
            session: getWrapper(window.sessionStorage),
            local:   getWrapper(window.localStorage)
        };

    };

    function getWrapper(storage) {

        return {

            set: function(name, value) {
                storage[name] = angular.toJson(value);
            },

            get: function(name, defaultValue) {
                return storage[name] === undefined ? defaultValue : angular.fromJson(storage[name]);
            },

            clear: function(name) {

                if (name !== undefined) {
                    return storage.removeItem(name);
                }

                return storage.clear();
            }

        }

    };

})();