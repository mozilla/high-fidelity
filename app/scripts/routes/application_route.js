HighFidelity.IndexRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('podcasts');
    }
});
