'use strict';

export default {
    formatTime: function(secs) {
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
    },

    timestamp: function(date) {
        if (!date) {
            date = new Date();
        }

        if (date instanceof Date !== true) {
            date = new Date(date);
        }

        return Math.round(date.getTime() / 1000);
    }
};
