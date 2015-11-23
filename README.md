phidias/api
es un paquete que define un framework para hacer APIs en PHP

phidias/angular
es un paquete que define un framework para hacer clientes en AngularJS (con herramientas para consumir APIs, como los de phidias/api)

Los paquetes que observan el framework phidias/api se nombran vendor/package.api
Los paquetes que observan el framework phidias/angular se nombran vendor/package.ng


phidias/angular
    README.md
    phidias-gulp.js
    gulpfile.js
    src/
        components/
            services/
                api/
                    api.js   (phidiasApi)
                    token.js (phidiasApiToken)

        module.js ("phidias")


phidias/ui.ng
    gulpfile.js
    src/
        components/
            directives/
                ... shitload of <phi-*> directives 
                <phi-object>

        module.js ("phidias.ui")


phidias/core.ng    // This is the mobile app :) formerly known as phidias.client
    src/
        objects/
            person (phidiasPersonObject)
            node   (phidiasNodeObject)
            type   (phidiasTypeObject)

        states/
            woo



phidias/core-posts.ng
    gulpfile.js
    src/
        components/
            directives/
                elements/
                    post-editor/   (<phidias-post-editor>)

        module.js ("phidias.core-posts")


phidias/directory.ng

    gulpfile.js

        phidias.build({

            name:   'phidias.directory',
            src:    'src',
            output: 'public/build',

            require: {

                js: [
                    'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0/angular.min.js',
                    'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0/angular-animate.min.js',
                    'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0/angular-aria.min.js',
                    'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0/angular-sanitize.min.js',

                    '../vendor/phidias/ui.ng/public/build/phidias.ui.js',
                    '../vendor/phidias/api.ng/public/build/phidias.api.js',
                    '../vendor/phidias/core-posts.ng/public/build/phidias.core-posts.js',
                ],

                css: [
                ]
            }

        });


    src/
        module.js ("phidias.directory")

    public/
        index.html
        build/
            phidias.directory.js
            phidias.directory.min.js
            phidias.directory.css
            phidias.directory.min.css

            phidias.directory.app.js
            phidias.directory.app.css

# api.js
