HighFidelity.PodcastsRoute = Ember.Route.extend({
    model: function() {
        return this.get('store').find('podcast');
    },

    renderTemplate: function(controller, model) {
        // Inside a podcast view, we use the "add podcast" button
        this.render('header-actions/podcasts', {
            outlet: 'headerAction'
        });

        this.render('podcasts');
    }
});
