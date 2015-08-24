import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
      return this.store;
  },
  actions: {
    closeModal: function() {
      return this.disconnectOutlet({
        outlet: 'modal',
        parentView: 'application'
      });
    },
    openModal: function(modalName) {
      return this.render(modalName, {
        into: 'application',
        outlet: 'modal'
      });
    }
  }
});
