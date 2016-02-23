(function() {
    'use strict';

    angular
        .module('phidias-api', [
            'angularFileUpload'
        ]);

})();
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
//Borrowed from https://cdn.rawgit.com/auth0/angular-jwt/master/dist/angular-jwt.js
(function() {
    'use strict';

    // factory
    angular
        .module('phidias-api')
        .factory('phidiasApiToken', phidiasApiToken);

    function phidiasApiToken() {

        return {
            decode:            decode,
            isExpired:         isExpired,
            getExpirationDate: getExpirationDate
        };

        //////////////////

        function decode(token) {
            var parts = token.split('.');

            if (parts.length !== 3) {
                throw new Error('JWT must have 3 parts');
            }

            var decoded = urlBase64Decode(parts[1]);
            if (!decoded) {
                throw new Error('Cannot decode the token');
            }

            return JSON.parse(decoded);
        };

        function isExpired(token) {
            var d = getExpirationDate(token);

            if (!d) {
                return false;
            }

            // Token expired?
            return !(d.valueOf() > new Date().valueOf());
        };

        function getExpirationDate(token) {
            var decoded;
            decoded = decode(token);

            if(!decoded.exp) {
                return null;
            }

            var d = new Date(0); // The 0 here is the key, which sets the date to the epoch
            d.setUTCSeconds(decoded.exp);

            return d;
        };

        function urlBase64Decode(str) {
            var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0: { break; }
                case 2: { output += '=='; break; }
                case 3: { output += '='; break; }
                default: {
                    throw 'Illegal base64url string!';
                }
            }
            // return window.atob(output); //polifyll https://github.com/davidchambers/Base64.js
            return decodeURIComponent(escape(window.atob(output))); //polifyll https://github.com/davidchambers/Base64.js
        };

    }

})();
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
(function() {
    'use strict';

    angular
        .module("phidias-api")
        .directive("phidiasApiIcons", phidiasApiIcons);

    function phidiasApiIcons() {

        return {

            restrict: "E",

            scope: {
                "url":     "@",
                "ngModel": "="
            },

            controller:       phidiasApiIconsController,
            controllerAs:     "vm",
            bindToController: true,

            template:   '<ul>' + 
                            '<li ng-repeat="icon in vm.icons">' + 
                                '<span phi-icon="{{icon}}" ng-click="vm.selectIcon(icon)" ng-class="{selected: vm.ngModel == icon}"></span>' + 
                            '</li>' + 
                        '</ul>'

        };


        function phidiasApiIconsController() {

            var vm    = this;
            
            vm.icons      = [];
            vm.reload     = reload;
            vm.selectIcon = selectIcon;

            initialize();

            ////////////////////////

            function initialize() {
                vm.reload();
            }

            function reload() {

                vm.icons = [
                    'fa-adjust',
                    'fa-anchor',
                    'fa-archive',
                    'fa-asterisk',
                    'fa-barcode',
                    'fa-bars',
                    'fa-beer',
                    'fa-bell',
                    'fa-bell-o',
                    'fa-bolt',
                    'fa-book',
                    'fa-bookmark',
                    'fa-bookmark-o',
                    'fa-briefcase',
                    'fa-bug',
                    'fa-building-o',
                    'fa-bullhorn',
                    'fa-bullseye',
                    'fa-calendar',
                    'fa-calendar-o',
                    'fa-camera',
                    'fa-camera-retro',
                    'fa-certificate',
                    'fa-circle',
                    'fa-circle-o',
                    'fa-clock-o',
                    'fa-cloud',
                    'fa-cloud-download',
                    'fa-cloud-upload',
                    'fa-code',
                    'fa-code-fork',
                    'fa-coffee',
                    'fa-cog',
                    'fa-cogs',
                    'fa-comment',
                    'fa-comment-o',
                    'fa-comments',
                    'fa-comments-o',
                    'fa-compass',
                    'fa-credit-card',
                    'fa-crop',
                    'fa-crosshairs',
                    'fa-cutlery',
                    'fa-desktop',
                    'fa-dot-circle-o',
                    'fa-download',
                    'fa-ellipsis-h',
                    'fa-ellipsis-v',
                    'fa-envelope',
                    'fa-envelope-o',
                    'fa-eraser',
                    'fa-exchange',
                    'fa-exclamation',
                    'fa-exclamation-circle',
                    'fa-exclamation-triangle',
                    'fa-external-link',
                    'fa-external-link-square',
                    'fa-eye',
                    'fa-eye-slash',
                    'fa-female',
                    'fa-fighter-jet',
                    'fa-film',
                    'fa-filter',
                    'fa-fire',
                    'fa-fire-extinguisher',
                    'fa-flag',
                    'fa-flag-checkered',
                    'fa-flag-o',
                    'fa-flask',
                    'fa-folder',
                    'fa-folder-o',
                    'fa-folder-open',
                    'fa-folder-open-o',
                    'fa-frown-o',
                    'fa-gamepad',
                    'fa-gavel',
                    'fa-gift',
                    'fa-glass',
                    'fa-globe',
                    'fa-hdd-o',
                    'fa-headphones',
                    'fa-heart',
                    'fa-heart-o',
                    'fa-home',
                    'fa-inbox',
                    'fa-info',
                    'fa-info-circle',
                    'fa-key',
                    'fa-keyboard-o',
                    'fa-laptop',
                    'fa-leaf',
                    'fa-lemon-o',
                    'fa-level-down',
                    'fa-level-up',
                    'fa-lightbulb-o',
                    'fa-location-arrow',
                    'fa-lock',
                    'fa-magic',
                    'fa-magnet',
                    'fa-male',
                    'fa-map-marker',
                    'fa-meh-o',
                    'fa-microphone',
                    'fa-microphone-slash',
                    'fa-minus',
                    'fa-minus-circle',
                    'fa-minus-square',
                    'fa-minus-square-o',
                    'fa-mobile',
                    'fa-money',
                    'fa-moon-o',
                    'fa-music',
                    'fa-pencil',
                    'fa-pencil-square',
                    'fa-pencil-square-o',
                    'fa-phone',
                    'fa-phone-square',
                    'fa-picture-o',
                    'fa-plane',
                    'fa-plus',
                    'fa-plus-circle',
                    'fa-plus-square',
                    'fa-plus-square-o',
                    'fa-power-off',
                    'fa-print',
                    'fa-puzzle-piece',
                    'fa-qrcode',
                    'fa-question',
                    'fa-question-circle',
                    'fa-quote-left',
                    'fa-quote-right',
                    'fa-random',
                    'fa-refresh',
                    'fa-reply',
                    'fa-reply-all',
                    'fa-retweet',
                    'fa-road',
                    'fa-rocket',
                    'fa-rss',
                    'fa-rss-square',
                    'fa-search',
                    'fa-search-minus',
                    'fa-search-plus',
                    'fa-share',
                    'fa-share-square',
                    'fa-share-square-o',
                    'fa-shield',
                    'fa-shopping-cart',
                    'fa-sign-in',
                    'fa-sign-out',
                    'fa-signal',
                    'fa-sitemap',
                    'fa-smile-o',
                    'fa-square',
                    'fa-square-o',
                    'fa-star',
                    'fa-star-half',
                    'fa-star-half-o',
                    'fa-star-o',
                    'fa-suitcase',
                    'fa-sun-o',
                    'fa-tablet',
                    'fa-tachometer',
                    'fa-tag',
                    'fa-tags',
                    'fa-tasks',
                    'fa-terminal',
                    'fa-thumb-tack',
                    'fa-thumbs-down',
                    'fa-thumbs-o-down',
                    'fa-thumbs-o-up',
                    'fa-thumbs-up',
                    'fa-ticket',
                    'fa-times',
                    'fa-times-circle',
                    'fa-times-circle-o',
                    'fa-tint',
                    'fa-trash-o',
                    'fa-trophy',
                    'fa-truck',
                    'fa-umbrella',
                    'fa-unlock',
                    'fa-unlock-alt',
                    'fa-upload',
                    'fa-user',
                    'fa-users',
                    'fa-video-camera',
                    'fa-volume-down',
                    'fa-volume-off',
                    'fa-volume-up',
                    'fa-wheelchair',
                    'fa-wrench'
                ];

            }

            function selectIcon(icon) {
                vm.ngModel = icon;
            }

        }



    }

})();
(function() {

    angular
        .module("phidias-api")
        .directive("phidiasApiResource", phidiasApiResource);

    function phidiasApiResource() {

        return {

            restrict: "E",

            scope: {
                type: "@",
                src:  "@"
            },

            bindToController: true,
            controller:       phidiasApiResourceController,
            controllerAs:     "vm",

            template: '<div>could not load {{vm.type}} {{vm.src}}</div>'
        };

    };


    phidiasApiResourceController.$inject = ["$element", "$compile", "$scope", "$injector"];
    function phidiasApiResourceController($element, $compile, $scope, $injector) {

        var expectedDirectiveName = "phidiasApiResource" + this.type.charAt(0).toUpperCase() + this.type.slice(1).toLowerCase() + 'Directive';

        if ($injector.has(expectedDirectiveName) ) {
            var e = $compile('<phidias-api-resource-' + this.type + ' src="{{vm.src | trustAsResourceUrl}}"></phidias-api-resource-' + this.type + '>')($scope);
            $element.empty().append(e);
        }

    };

})();
(function() {
    'use strict';

    angular
        .module("phidias-api")
        .directive("phidiasApiResourceFiles", phidiasApiResourceFiles);

    function phidiasApiResourceFiles() {

        return {

            restrict: "E",
            scope: {
                src: "@"
            },
            controller:       phidiasApiResourceFilesController,
            controllerAs:     "vm",
            bindToController: true,

            template:   '<ul>' +
                            '<li ng-repeat="item in vm.files" class="phidias-api-resource-files-file" ng-class="{selected: selected.url == item.url}" ng-click="select(item)">' +
                                '<a class="thumbnail" target="_blank" href="{{item.url}}">' +
                                    '<img ng-if="!!item.thumbnail" ng-src="{{item.thumbnail}}" />' +
                                '</a>' +
                                '<a class="details" target="_blank" href="{{item.url}}">' +
                                    '<h3 ng-bind="item.title"></h3>' +
                                    '<p>{{item.size|bytes}} - {{item.name}}</p>' +
                                '</a>' +
                            '</li>' +
                        '</ul>'
        };

    }

    phidiasApiResourceFilesController.$inject = ["phidiasApi"];
    function phidiasApiResourceFilesController(phidiasApi) {

        var vm   = this;
        vm.files = [];

        phidiasApi.get(vm.src)
            .success(function(response) {
                vm.files = response;
            });

    }

})();
(function() {
    'use strict';

    angular
        .module("phidias-api")
        .directive("phidiasApiResourceForm", phidiasApiResourceForm);

    function phidiasApiResourceForm() {

        return {

            restrict: "E",

            scope: {
                src: "@"
            },

            bindToController: true,

            controller:       phidiasApiResourceFormController,
            controllerAs:     "vm",

            template:   '<form ng-if="!!vm.entity && !vm.records.length">' + 
                            '<fieldset>' +

                                '<div ng-repeat="field in vm.entity.fields" ng-switch="field.type" class="phidias-api-resource-form-field">' +

                                    '<div ng-switch-when="text">' +
                                        '<label ng-bind="field.title"></label>' +
                                        '<input ng-model="vm.currentRecord[field.name]" type="text" />' +
                                    '</div>' +

                                    '<div ng-switch-when="textarea">' +
                                        '<label ng-bind="field.title"></label>' +
                                        '<textarea ng-model="vm.currentRecord[field.name]"></textarea>' +
                                    '</div>' +

                                    '<div ng-switch-when="select">' +
                                        '<label ng-bind="field.title"></label>' +
                                        '<select ng-model="vm.currentRecord[field.name]">' +
                                            '<option value="">---</option>' +
                                            '<option ng-repeat="line in field.options | lines" value="{{line}}">{{line}}</option>' +
                                        '</select>' +
                                    '</div>' +

                                    '<div ng-switch-when="checkbox">' +
                                        '<input type="checkbox" ng-model="vm.currentRecord[field.name]">{{field.title}}</input>' +
                                    '</div>' +

                                    '<p ng-bind="field.description"></p>' +

                                '</div>' + 

                            '</fieldset>' +

                            '<footer>' + 
                                '<phi-button ng-click="vm.saveCurrentRecord()">Enviar</phi-button>' +
                            '</footer>' + 

                        '</form>' + 

                        '<div ng-if="!!vm.records.length">' + 
                            '<fieldset ng-repeat="record in vm.records">' +
                                '<div ng-repeat="field in vm.entity.fields">' +
                                    '<strong ng-bind="field.title"></strong>: <span ng-bind="record.values[field.name]"></span>' +
                                '</div>' +
                            '</fieldset>' +
                        '</div>'
        };


    };


    phidiasApiResourceFormController.$inject = ["phidiasApi"];
    function phidiasApiResourceFormController(phidiasApi) {

        var vm               = this;
        vm.entity            = null;
        vm.records           = null;
        vm.currentRecord     = {};
        vm.saveCurrentRecord = saveCurrentRecord;

        // Determine the current user, and the records URL
        var recordsUrl  = null;

        phidiasApi.get(vm.src)
            .success(function(response) {
                vm.entity = response;

                // Fetch records
                if (phidiasApi.token) {

                    recordsUrl = 'people/' + phidiasApi.token.id + '/data/entities/' + vm.entity.id + '/records';

                    phidiasApi.get(recordsUrl)
                        .success(function(records) {
                            vm.records = records;
                        });

                }

            });

        ///////////////////////////////

        function saveCurrentRecord() {

            if (!recordsUrl) {
                return;
            }

            phidiasApi.post(recordsUrl, vm.currentRecord)
                .success(function(response, code, headers) {
                    vm.records       = [response];
                    vm.currentRecord = {};
                });

        }

    };



})();
(function() {
    'use strict';

    angular
        .module("phidias-api")
        .directive("phidiasApiResourceHtml", phidiasApiResourceHtml);


    function phidiasApiResourceHtml() {

        return {
            restrict: "E",

            scope: {
                src: "@"
            },

            bindToController: true,
            controller:       phidiasApiResourceHtmlController,
            controllerAs:     "vm",

            template:   '<div ng-bind-html="vm.html.body"></div>'
        };

    }


    phidiasApiResourceHtmlController.$inject = ["phidiasApi"];
    function phidiasApiResourceHtmlController(phidiasApi) {

        var vm  = this;
        vm.html = null;

        phidiasApi.get(vm.src)
            .success(function(response) {
                vm.html = response;

            });

    }

})();
(function() {
    'use strict';

    angular
        .module("phidias-api")
        .directive("phidiasApiResourceYoutube", phidiasApiResourceYoutube);


    function phidiasApiResourceYoutube() {

        return {
            restrict: "E",

            scope: {
                src: "@"
            },

            bindToController: true,
            controller:       phidiasApiResourceYoutubeController,
            controllerAs:     "vm",

            template:   '<div>' +
                            '<iframe ng-if="!!vm.videoId" width="100%" height="420" ng-src="{{\'https://www.youtube.com/embed/\' + vm.videoId | trustAsResourceUrl}}" frameborder="0" allowfullscreen></iframe>' + 
                        '</div>'
        };

    }


    phidiasApiResourceYoutubeController.$inject = ["phidiasApi"];
    function phidiasApiResourceYoutubeController(phidiasApi) {
        var vm     = this;
        vm.videoId = getYoutubeId(vm.src);
    }

    function getYoutubeId(url) {

        if (!url.trim().length) {
            return null;
        }

        var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        var match  = url.match(regExp);
        if (match && match[2].length == 11) {
            return match[2];
        } else {
            return null;
        }
    };

})();
/*
This element provides an interface with a phidias filesystem endpoint
(see phidias/filesystem.api)

<phidias-api-resource-files-editor url="http://valid/phidias/filesystem/"></phidias-api-resource-files-editor>

*/


(function() {
    'use strict';

    angular
        .module("phidias-api")
        .directive("phidiasApiResourceFilesEditor", phidiasApiResourceFilesEditor);


    phidiasApiResourceFilesEditor.$inject = ["phidiasApi", "FileUploader"];
    function phidiasApiResourceFilesEditor(phidiasApi, FileUploader) {

        return {

            restrict: "E",

            scope: {
                "src":      "@",
                "onSelect": "&",
                "onChange": "&"
            },

            template:   '<div>' +

                            '<ul>' +
                                '<li ng-repeat="item in items" class="phidias-api-resource-files-file" ng-class="{selected: selected.url == item.url}" ng-click="select(item)">' +
                                    '<a class="thumbnail" target="_blank" href="{{item.url}}">' +
                                        '<img ng-if="!!item.thumbnail" ng-src="{{item.thumbnail}}" />' +
                                    '</a>' +
                                    '<div class="details">' + 
                                        '<phi-input ng-model="item.title" ng-change="change(item)" ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 1000, \'blur\': 0 } }"></phi-input>' +
                                        '<p>{{item.size|bytes}} - {{item.name}}</p>' + 
                                    '</div>' + 
                                    '<a class="phidias-api-resource-files-file-delete" ng-click="delete(item, $event)" phi-icon="fa-trash-o"></a>' +
                                '</li>' +
                            '</ul>' +

                            '<div ng-if="uploader">' +

                                '<ul>' +
                                    '<li ng-repeat="item in uploader.queue" class="phidias-api-resource-files-file">' +
                                        '<div class="thumbnail">' +
                                            '<div ng-if="item.file.type.substring(0,5) == \'image\'" ng-thumb="{file: item._file, height: 100}"></div>' +
                                        '</div>' +
                                        '<div class="details">' + 
                                            '<h3 ng-bind="item.file.name"></h3>' +
                                        '</div>' + 
                                        '<progress max="100" value="{{item.progress}}"></progress>' +
                                        '<a class="phidias-api-resource-files-file-delete" ng-click="item.remove()" phi-icon="fa-times"></a>' +
                                    '</li>' +
                                '</ul>' +

                                '<div class="phidias-api-filesystem-dropzone" nv-file-over uploader="uploader" ng-click="clickDropZone()">' + 
                                    '<div nv-file-drop uploader="uploader">Arrastra archivos aqu&iacute; o haz click</div>' + 
                                '</div>' +
                                '<input class="file-input" type="file" nv-file-select uploader="uploader" multiple />' +

                            '</div>' + 

                        '</div>',

            link: phidiasApiResourceFilesEditorLink
        };


        function phidiasApiResourceFilesEditorLink(scope, element, attributes) {

            scope.selected  = scope.ngModel;
            scope.items     = [];
            scope.uploader  = null;

            scope.reload = function() {

                return phidiasApi.get(scope.src)
                        .success(function (data) {
                            scope.items = data;
                        });

            };

            scope.delete = function(item, event) {

                event.stopPropagation();

                if (!confirm("Eliminar este archivo?")) {
                    return;
                }

                phidiasApi.delete(item.endpoint + "/" + item.path)
                    .success(function (data) {
                        scope.items.splice(scope.items.indexOf(item), 1);
                        scope.onChange({items: scope.items});
                    });

            };

            scope.select = function(item) {
                if (attributes.onSelect) {
                    scope.selected = item;
                    scope.onSelect({item: item});
                }
            };


            scope.change = function(item) {

                phidiasApi.put(item.endpoint + "/" + item.path, item)
                    .success(function (data) {
                        // do nothing, really
                    });

            };


            attributes.$observe("src", function(src) {

                var uploadsUrl = phidiasApi.host ? phidiasApi.host + "/" + scope.src : scope.src;

                scope.uploader = new FileUploader({url: uploadsUrl});

                scope.uploader.onAfterAddingAll = function(addedItems) {
                    scope.uploader.uploadAll();
                };

                scope.uploader.onCompleteAll = function() {
                    scope.uploader.clearQueue();
                    scope.reload().success(function() {
                        scope.onChange({items: scope.items});
                    });
                };

                scope.reload();

            });


            scope.clickDropZone = function() {

                var inputs = element.find('input');
                for (var cont = 0; cont < inputs.length; cont++) {
                    if ( inputs[cont].type == "file" ) {
                        inputs[cont].click();
                        break;
                    }
                }

            };



        }



    }

})();