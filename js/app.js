define({
    name: 'app',
    requires: [
        'views/init'
    ],
    def: function appInit() {
        'use strict';

        console.log('app::def');

        function init() {
            console.log('app::init');
        }

        return {
            init: init
        };
    }
});
