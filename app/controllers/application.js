import Ember from 'ember';

export default Ember.Controller.extend({
    isPackaged: function() {
        return EmberHifi.get('isPackaged');
    }.property('application.isPackaged')
});
