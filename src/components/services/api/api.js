(function() {
    'use strict';

    angular
        .module('phidias-api')
        .provider('phidiasApi', phidiasApi);

    function phidiasApi() {

        var provider      = this;
        provider.host     = null;
        provider.setHost  = setProviderHost;

        provider.$get     = service;

        /////////////////////////////////////////////////////

        function setProviderHost(host) {
            provider.host = host;
        }

        service.$inject = ['$http', 'phidiasApiToken', 'phidiasStorage'];
        function service($http, phidiasApiToken, phidiasStorage) {

            var service = {

                /* Service configuration */
                host:    provider.host,
                setHost: setHost,

                /* Authentication functions */
                tokenString:     null,
                token:           null, //decoded token payload
                isAuthenticated: false,
                setToken:        setToken,
                login:           login,
                logout:          logout,

                /* Main service functions */
                get:      get,
                post:     post,
                put:      put,
                patch:    patch,
                options:  options,
                remove:   deleteFn,  //alias, when phidiasApi.delete() causes a syntax error ('delete' is a reserved JS keyword)
                'delete': deleteFn,


                /* Event listeners */
                listeners: {
                    login:  [],
                    logout: []
                },

                onLogin:  onLogin,
                onLogout: onLogout
            }

            activate();

            return service;

            ///////

            function activate() {
                /* Look for existing session */
                var storedToken = phidiasStorage.session.get('phidiasApi.tokenString');
                if (storedToken) {
                    service.setToken(storedToken);
                }
            };

            function setHost(host) {
                service.host = host;
            };

            function onLogin(callback) {
                service.listeners.login.push(callback);
            };

            function onLogout(callback) {
                service.listeners.logout.push(callback);
            };

            function login(username, password) {

                return service.post('oauth/token', 'grant_type=client_credentials',
                        {
                            headers: {
                                'Authorization': 'Basic ' + btoa(username + ':' + password),
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }
                    )
                    .success(function(data) {
                        service.setToken(data.access_token);

                        for (var cont = 0; cont < service.listeners.login.length; cont++) {
                            service.listeners.login[cont](service);
                        }

                    });

            }

            function setToken(tokenString) {
                service.token           = phidiasApiToken.decode(tokenString);
                service.tokenString     = tokenString;
                service.isAuthenticated = true;

                phidiasStorage.session.set('phidiasApi.tokenString', tokenString);
            }

            function logout() {
                service.tokenString     = null;
                service.token           = null;
                service.isAuthenticated = false;
                phidiasStorage.session.clear('phidiasApi.tokenString');

                for (var cont = 0; cont < service.listeners.logout.length; cont++) {
                    service.listeners.logout[cont](service);
                }

            }

            function get(resource, data, config) {
                return execute('get', resource, data, config);
            }

            function post(resource, data, config) {
                return execute('post', resource, data, config);
            }

            function put(resource, data, config) {
                return execute('put', resource, data, config);
            }

            function patch(resource, data, config) {
                return execute('patch', resource, data, config);
            }

            function options(resource, data, config) {
                return execute('options', resource, data, config);
            }

            function deleteFn(resource, data, config) {
                return execute('delete', resource, data, config);
            }


            function execute(method, resource, data, config) {

                var request = {
                    method: method,
                    url:    service.host ? service.host + '/' + resource : resource,
                    data:   data
                };

                if (service.tokenString) {
                    angular.extend(request, {
                        headers: {
                            Authorization: 'Bearer ' + service.tokenString
                        }
                    });
                }

                angular.extend(request, config);

                if (method == 'get') {
                    request.url += '?' + serialize(data);
                    request.data = null;
                }

                return $http(request, config);

            }


            function serialize(obj, prefix) {

                var str = [];
                for(var p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        var k = prefix ? prefix + '[' + p + ']' : p;
                        var v = obj[p];

                        if (v == null) {
                            continue;
                        }

                        if (typeof v == 'object') {
                            str.push(serialize(v, k));
                        } else if (typeof v == 'number' || v.length > 0) {
                            str.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
                        }

                    }
                }

                return str.join('&');
            }


        }

    }

})();