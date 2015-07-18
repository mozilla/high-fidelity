import Ember from 'ember';

export default Ember.ArrayController.extend({
    needs: ['player'],

    sortAscending: false,
    sortProperties: ['datePublished'],

    actions: {
        download: function(episode) {
            episode.download();
        },

        setEpisode: function(episode) {
            if (!episode.get('isDownloaded')) {
                console.log('Not downloaded');
                this.get('controllers.player').send('setEpisode', episode);
            } else {
                console.log('Start playing!');
                this.get('controllers.player').send('setEpisode', episode);
            }
        }
    }
});
