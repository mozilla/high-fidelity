import Ember from 'ember';

export default Ember.ArrayController.extend({
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
            console.log('This Get selectedEpisode: ', this.get('selectedEpisode'));
            if (!episode.get('isDownloaded')) {
                console.log('Not downloaded');
                console.log("CONTROLLERS PLAYER: ", this.get('controllers.player'));
                this.get('controllers.player').send('setEpisode', episode);
            } else {
                console.log('Start playing!');
                this.get('controllers.player').send('setEpisode', episode);
            }
        }
    }
});
