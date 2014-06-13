HighFidelity.PlayerController = Ember.ObjectController.extend({
    progressBar: {
        max: 0,
        value: 0
    },
    setToPlayAfterLoaded: false,
    timeElapsed: '--:--',
    timeRemaining: '--:--',
    timeTotal: '--:--',

    actions: {
        pause: function(episode) {
            clearTimeout(this._timeUpdateTimeout);
            $('#audio-player')[0].pause();

            episode.set('playbackPosition', $('#audio-player')[0].currentTime);
            episode.set('isPlaying', false);
            episode.save();
        },

        play: function(episode) {
            $('#audio-player')[0].play();
            episode.set('isPlaying', true);
        },

        setEpisode: function(episode) {
            this.set('model', episode);

            if (this.get('model').get('audioFile')) {
                // TODO.
                this.set('audio', null);
            } else {
                this.set('audio', this.get('model').get('audioURL'));
                this.playAfterSet();
            }
        }
    },

    playAfterSet: function() {
        var audio = $('#audio-player')[0];
        var _this = this;

        $(audio).attr('src', this.get('audio'));

        $(audio).bind('canplay', function() {
            $(this).unbind('canplay');

            if (_this.get('model').get('playbackPosition')) {
                audio.currentTime = _this.get('model').get('playbackPosition');
            }

            _this.updateTime();
            _this.set('timeTotal', HighFidelity.formatTime(audio.duration));

            _this.send('play', _this.get('model'));
        });

        this._timeUpdateTimeout = setTimeout(function() {
            _this.updateTime();
        }, 1000);
    },

    updateTime: function() {
        var audio = $('#audio-player')[0];
        var _this = this;

        this.set('timeElapsed', HighFidelity.formatTime(audio.currentTime));
        this.set('timeRemaining',
                 HighFidelity.formatTime(audio.duration - audio.currentTime));

        this.set('progressBar.max', audio.duration);
        this.set('progressBar.value', audio.currentTime);

        this._timeUpdateTimeout = setTimeout(function() {
            _this.updateTime();
        }, 1000);
    }
});
