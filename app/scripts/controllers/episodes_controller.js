HighFidelity.EpisodesController = Ember.ArrayController.extend({
    needs: ['player'],

    sortAscending: false,
    sortProperties: ['datePublished'],

    actions: {
        setEpisode: function(episode) {
            this.get('controllers.player').send('setEpisode', episode);
        }
    }
});
