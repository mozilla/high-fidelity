HighFidelity.PodcastRoute = Ember.Route.extend({
    model: function(params) {
        return this.get('store').find('podcast', params.podcast_id);
    },

    renderTemplate: function(controller, model) {
        // Inside a podcast view, our "action button" changes from the
        // "add podcast" action to the "refresh episodes" action.
        this.render('header-actions/podcast', {
            outlet: 'headerAction'
        });

        this.render('podcast');
    }
});
