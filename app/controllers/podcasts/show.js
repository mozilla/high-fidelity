import Ember from 'ember';

export default Ember.Controller.extend({
  sortedEpisodes: function() {
    return Ember.ArrayProxy.extend(Ember.SortableMixin).create({
      sortAscending: false,
      sortProperties: ['datePublished'],
      content: this.get('model').get('episodes')
    });
  }.property('model'),
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
