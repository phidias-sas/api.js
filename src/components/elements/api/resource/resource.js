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


        phidiasApiResourceController.$inject = ["$element", "$compile", "$scope", "$injector"];
        function phidiasApiResourceController($element, $compile, $scope, $injector) {

            var expectedDirectiveName = "phidiasApiResource" + this.type.charAt(0).toUpperCase() + this.type.slice(1).toLowerCase() + 'Directive';

            if ($injector.has(expectedDirectiveName) ) {
                var e = $compile('<phidias-api-resource-' + this.type + ' src="{{vm.src}}"></phidias-api-resource-' + this.type + '>')($scope);
                $element.empty().append(e);
            }

        };


    };


})();