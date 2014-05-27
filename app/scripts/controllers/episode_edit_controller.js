HighFidelity.EpisodeEditController = Ember.ObjectController.extend({
  needs: 'episode',
  actions: {
    save: function(){
      self = this
      this.get('buffer').forEach(function(attr){
        self.get('controllers.episode.model').set(attr.key, attr.value);
      });
      this.transitionToRoute('episode',this.get('model'));
    }
  }
});

