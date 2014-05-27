HighFidelity.EpisodesRoute = Ember.Route.extend({
  model: function() {
    return this.get('store').find('episode');
  }
});
