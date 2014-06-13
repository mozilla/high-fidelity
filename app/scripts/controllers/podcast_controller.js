HighFidelity.PodcastController = Ember.ObjectController.extend({
    actions: {
        delete: function() {
            this.get('model').destroyRecord();
            this.transitionToRoute('podcasts');
        },

        update: function() {
            this.get('model').update();
        }
    }
});
