import Ember from 'ember';

export default Ember.Route.extend({
  i18n: Ember.inject.service(),
  model: function() {
      return this.store;
  },
  afterModel: function(user) {
    var i18nLocales = this.get('i18n.locales');
    var locale = (window.navigator.language || window.navigator.browserLanguage).split('-')[0];
    this.set('i18n.locale', locale);
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
