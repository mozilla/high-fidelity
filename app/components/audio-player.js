import Ember from 'ember';
import timeStamper from 'high-fidelity/lib/timestamp';

export default Ember.Component.extend({
    init: function() {
        this._super.apply(this, arguments);
        this.set('model', null);
        this.PlayerEvents.subscribe('pauseEpisode', this, function(episode) {
            this.send('pause', episode);
        });
        this.PlayerEvents.subscribe('playEpisode', this, 'setEpisode');
    },
    _hasAudio: function() {
        if (this.get('model')) {
            this.set('isPopulated', !!this.get('model').get('id'));
        }
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
            clearTimeout(this._timeUpdateTimeout);
            clearTimeout(this._saveInBackgroundTimeout);
            Ember.$('#audio-player')[0].pause();

            episode.set('playbackPosition', Ember.$('#audio-player')[0].currentTime);
            episode.set('isPlaying', false);
            episode.save();
        },

        play: function(episode) {
            Ember.$('#audio-player')[0].play();
            episode.set('isPlaying', true);
            this._saveInBackground();
            this.updateTime();
        },

        rewind: function(episode) {
            Ember.$('#audio-player')[0].currentTime -= this.get('skipTime');
            episode.set('playbackPosition', Ember.$('#audio-player')[0].currentTime);
        },

        forward: function(episode) {
            Ember.$('#audio-player')[0].currentTime += this.get('skipTime');
            episode.set('playbackPosition', Ember.$('#audio-player')[0].currentTime);
        }
    },

    setEpisode: function(episode) {
        this.set('model', episode);
        this.set('audio', this.get('model').get('audioURL'));
        this.PlayerEvents.currentEpisode = episode;
        this.resetPlayer();
    },

    resetPlayer: function() {
        var audio = Ember.$('#audio-player')[0];
        var _this = this;

        Ember.$(audio).attr('src', this.get('audio'));

        Ember.$(audio).bind('canplay', function() {
            Ember.$(this).unbind('canplay');

            if (_this.get('model').get('playbackPosition')) {
                audio.currentTime = _this.get('model').get('playbackPosition');
            }
            _this.send('play', _this.get('model'));
        });

    },

    updateTime: function() {
        var audio = Ember.$('#audio-player')[0];
        var _this = this;

        this.set('progressBar.max', audio.duration);
        this.set('progressBar.value', audio.currentTime);

        this.set('timeElapsed', timeStamper.formatTime(audio.currentTime));
        this.set('timeRemaining', timeStamper.formatTime(audio.duration - audio.currentTime));

        this._timeUpdateTimeout = setTimeout(function() {
            _this.updateTime();
        }, 1000);
    },

    _saveInBackground: function() {
        var audio = Ember.$('#audio-player')[0];
        var _this = this;

        this.get('model').set('playbackPosition', audio.currentTime);
        this.get('model').save();

        this._saveInBackgroundTimeout = setTimeout(function() {
            _this._saveInBackground();
        }, 10000);
    }
});
