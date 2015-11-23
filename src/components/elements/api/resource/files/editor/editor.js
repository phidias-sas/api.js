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