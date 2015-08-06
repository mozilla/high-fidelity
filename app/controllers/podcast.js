import Ember from 'ember';

export default Ember.Controller.extend({
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
