HighFidelity.EpisodeRoute = Ember.Route.extend({
    model: function(params) {
        return this.get('store').find('episode', params.episode_id);
    }
});

