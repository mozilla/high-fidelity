HighFidelity.PlayerController = Ember.ObjectController.extend({
    actions: {
        pause: function(episode) {
            $('#audio')[0].pause();
            episode.set('isPlaying', false);
        },
        play: function(episode) {
            $('#audio')[0].play();
            episode.set('isPlaying', true);
        },
        setEpisode: function(episode) {
            this.set('model', episode);

            Ember.run.scheduleOnce('afterRender', this, function() {
                this.send('play', this.get('model'));
            });
       }
    }
});
