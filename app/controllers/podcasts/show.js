import Ember from 'ember';

export default Ember.Controller.extend({
  episodeSorting: ['datePublished'],
  sortedEpisodes: Ember.computed.sort('model.episodes', 'episodeSorting'),
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
