HighFidelity.EpisodeEditController = Ember.ObjectController.extend({
    needs: 'episode',
    actions: {
        save: function(){
            var _this = this;

            this.get('buffer').forEach(function(attr) {
                _this.get('controllers.episode.model')
                     .set(attr.key, attr.value);
            });

            this.transitionToRoute('episode',this.get('model'));
        }
    }
});
