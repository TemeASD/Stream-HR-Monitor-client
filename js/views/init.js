define({
    name: 'views/init',
    requires: [
        'core/event',
        'core/systeminfo',
        'core/application',
        'views/main',
        'models/heartRate'
    ],
    def: function viewsPageInit(req) {
        'use strict';


        var event = req.core.event,


            app = req.core.application,

            sysInfo = req.core.systeminfo,

            heartRate = req.models.heartRate;



        function exit() {
            app.exit();
        }


        function onHardwareKeysTap(ev) {
            var keyName = ev.keyName,
                page = document.getElementsByClassName('ui-page-active')[0],
                pageid = page ? page.id : '';

            if (keyName === 'back') {
                if (pageid === 'main' || pageid === 'ajax-loader') {
                    heartRate.stop();
                    exit();
                } else {
                    history.back();
                }
            }
        }


        function onWindowResize() {
            event.fire('window.resize', { height: window.innerHeight });
        }


        function onLowBattery() {
            if (document.getElementsByClassName('ui-page-active')[0].id ===
                'register') {
                event.fire('register.menuBack');
            }
            exit();
        }


        function bindEvents() {
            event.on({ 'core.systeminfo.battery.low': onLowBattery });
            window.addEventListener('tizenhwkey', onHardwareKeysTap);
            window.addEventListener('resize', onWindowResize);
            sysInfo.listenBatteryLowState();
        }

        function init() {
            // bind events to page elements
            bindEvents();
            sysInfo.checkBatteryLowState();
        }

        return {
            init: init
        };
    }
});
