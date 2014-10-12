HighFidelity.PlayerController = Ember.ObjectController.extend({
    _hasAudio: function() {
        this.set('isPopulated', !!this.get('model').get('id'));
    }.observes('model'),

    isPopulated: false,
    progressBar: {
        max: 0,
        value: 0
    },
    setToPlayAfterLoaded: false,
    skipTime: 15, // Time, in seconds, to skip backward/forward.
    timeElapsed: '--:--',
    timeRemaining: '--:--',
    timeTotal: '--:--',

    actions: {
        pause: function(episode) {
            clearTimeout(this._saveInBackgroundTimeout);
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

        rewind: function(episode) {
            $('#audio-player')[0].currentTime -= this.get('skipTime');
            episode.set('playbackPosition', $('#audio-player')[0].currentTime);
        },

        forward: function(episode) {
            $('#audio-player')[0].currentTime += this.get('skipTime');
            episode.set('playbackPosition', $('#audio-player')[0].currentTime);
        },

        setEpisode: function(episode) {
            var _this = this;

            this.set('model', episode);

            if (this.get('model').get('isDownloaded')) {
                episode.blobURL().then(function(url) {
                    _this.set('audio', url);
                    _this.playAfterSet();
                });
            } else {
                this.set('audio', this.get('model').get('audioURL'));
                this.playAfterSet();
            }
        }
    },

    playAfterSet: function() {
        var audio = $('#audio-player')[0];
        var _this = this;

        console.log("this.get('audio')", this.get('audio'));
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

        this._saveInBackgroundTimeout = setTimeout(function() {
            _this._saveInBackground();
        }, 10000);
        _this.updateTime();
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
    },

    _saveInBackground: function() {
        var audio = $('#audio-player')[0];
        var _this = this;

        this.get('model').set('playbackPosition', audio.currentTime);
        this.get('model').save();

        this._saveInBackgroundTimeout = setTimeout(function() {
            _this._saveInBackground();
        }, 10000);
    }
});
