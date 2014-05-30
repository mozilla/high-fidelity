HighFidelity.PodcastEditController = Ember.ObjectController.extend({
    needs: 'podcast',

    actions: {
        save: function() {
            var _this = this;

            this.get('buffer').forEach(function(attr) {
                _this.get('controllers.podcast.model')
                     .set(attr.key, attr.value);
            });

            this.transitionToRoute('podcast', this.get('model'));
        }
    }
});
