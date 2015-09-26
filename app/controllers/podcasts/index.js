import Ember from 'ember';

export default Ember.Controller.extend({
  sortedPodcasts: function() {
    return Ember.ArrayProxy.extend(Ember.SortableMixin).create({
      sortProperties: ['title'],
      content: this.get('model')
    });
  }.property('model')
});
