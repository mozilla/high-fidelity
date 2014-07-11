// MozApps helpers.
(function() {
    'use strict';

    function checkIfPackaged(app) {
        // By default, we aren't a packaged app.
        app.isPackaged = false;

        if (window.navigator.mozApps) {
            var appRequest = window.navigator.mozApps.getSelf();

            appRequest.addEventListener('success', function() {
                if (appRequest.result) {
                    // The app is installed.
                    if (appRequest.result.manifest &&
                        appRequest.result.manifest.type === 'privileged') {
                        app.isPackaged = true;
                        app._permissions = appRequest.result.manifest
                                                            .permissions;

                        jQuery.ajaxSettings.xhr = function() {
                            try {
                                return new XMLHttpRequest({mozSystem: true});
                            } catch (error) {
                                console.error(error);
                            }
                        };
                    }
                }
            });
        } else {
            console.debug('Open Web Apps not supported');
        }
    }

    HighFidelity.MozApps = {
        checkIfPackaged: checkIfPackaged
    };
})();
