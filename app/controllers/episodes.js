import Ember from 'ember';

export default Ember.Controller.extend({
    needs: ['player'],

    sortAscending: false,
    sortProperties: ['datePublished'],
    selectedEpisode: null,

    actions: {
        download: function(episode) {
            episode.download();
        },

        setEpisode: function(episode) {
            this.set('selectedEpisode', episode);
            if (!episode.get('isDownloaded')) {
                this.get('controllers.player').send('setEpisode', episode);
            } else {
                this.get('controllers.player').send('setEpisode', episode);
            }
        }
    }
});
