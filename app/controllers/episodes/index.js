import Ember from 'ember';

export default Ember.Controller.extend({
    needs: ['player'],
    selectedEpisode: null,
    actions: {
        download: function(episode) {
            episode.download();
        },

        setEpisode: function(episode) {
            var currentEpisode = this.get('selectedEpisode');
            var episodeAlreadySelected = (episode === currentEpisode);

            if (episodeAlreadySelected) {
                if (episode.get('isPlaying')) {
                    this.get('controllers.player')._actions.pause(episode);
                } else {
                    this.get('controllers.player').playAfterSet();
                }
            } else {
                if (currentEpisode) {
                    this.get('controllers.player')._actions.pause(currentEpisode);
                }
                this.set('selectedEpisode', episode);
                if (!episode.get('isDownloaded')) {
                    this.get('controllers.player').send('setEpisode', episode);
                } else {
                    this.get('controllers.player').send('setEpisode', episode);
                }
            }
        }
    }
});
