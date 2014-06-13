// Time helpers.
(function() {
    'use strict';

    // Format a time in seconds to a pretty 5:22:75 style time. Cribbed from
    // the Gaia Music app.
    function formatTime(secs) {
        if (isNaN(secs)) {
            return '--:--';
        }

        var hours = parseInt(secs / 3600, 10) % 24;
        var minutes = parseInt(secs / 60, 10) % 60;
        var seconds = parseInt(secs % 60, 10);

        var time = (hours !== 0 ? hours + ':' : '') +
                   (minutes < 10 ? '0' + minutes : minutes) + ':' +
                   (seconds < 10 ? '0' + seconds : seconds);

        return time;
    }
    HighFidelity.formatTime = formatTime;

    // Return a timestamp from a JavaScript Date object. If no argument is
    // supplied, return the timestamp for "right now".
    function timestamp(date) {
        if (!date) {
            date = new Date();
        }

        if (date instanceof Date !== true) {
            date = new Date(date);
        }

        return Math.round(date.getTime() / 1000);
    }

    HighFidelity.timestamp = timestamp;
})();
