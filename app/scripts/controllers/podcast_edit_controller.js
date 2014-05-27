HighFidelity.PodcastEditController = Ember.ObjectController.extend({
    needs: 'podcast',
    actions: {
        save: function(){
            self = this
            this.get('buffer').forEach(function(attr){
                self.get('controllers.podcast.model').set(attr.key, attr.value);
            });
            this.transitionToRoute('podcast', this.get('model'));
        }
    }
});
