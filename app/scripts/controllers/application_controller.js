HighFidelity.ApplicationController = Ember.ObjectController.extend({
    isPackaged: function() {
        return HighFidelity.get('isPackaged');
    }.property('application.isPackaged')
});
