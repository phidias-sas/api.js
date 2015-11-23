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