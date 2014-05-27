HighFidelity.PodcastsRoute = Ember.Route.extend({
    model: function() {
        return this.get('store').find('podcast');
    }
});
