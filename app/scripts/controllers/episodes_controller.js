HighFidelity.EpisodesController = Ember.ArrayController.extend({
    needs: ['player'],

    sortAscending: false,
    sortProperties: ['datePublished', 'episodeId'],

    actions: {
        setEpisode: function(episode) {
            this.get('controllers.player').send('setEpisode', episode);
        }
    }
});
