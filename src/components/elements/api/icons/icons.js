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