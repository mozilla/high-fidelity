HighFidelity.PodcastRoute = Ember.Route.extend({
    model: function(params) {
        return this.get('store').find('podcast', params.podcast_id);
    }
});
