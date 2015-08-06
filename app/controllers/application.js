import Ember from 'ember';

export default Ember.Controller.extend({
    isPackaged: function() {
        return HighFidelity.get('isPackaged');
    }.property('application.isPackaged')
});
