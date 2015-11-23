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


        phidiasApiResourceHtmlController.$inject = ["phidiasApi"];
        function phidiasApiResourceHtmlController(phidiasApi) {

            var vm  = this;
            vm.html = null;

            phidiasApi.get(vm.src)
                .success(function(response) {
                    vm.html = response;

                });

        }

    }

})();