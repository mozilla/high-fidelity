HighFidelity.PodcastController = Ember.ObjectController.extend({
    actions: {
        update: function() {
            this.get('model').update();
        }
    }
});
