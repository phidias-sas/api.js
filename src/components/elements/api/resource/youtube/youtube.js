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
                            '<iframe ng-if="!!vm.videoId" width="100%" height="420" ng-src="{{\'http://www.youtube.com/embed/\' + vm.videoId | trustAsResourceUrl}}" frameborder="0" allowfullscreen></iframe>' + 
                        '</div>'
        };


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

    }

})();