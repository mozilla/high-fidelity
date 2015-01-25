HighFidelity.ProgressBarView = Ember.View.extend({
    eventManager: Ember.Object.create({
        mouseDown: function(event) {
            console.log(event, this);
            return;
            // this.set('isScrubberDragging', true);
            // this.seekTo(this.event.pageX);
        },

        mouseMove: function(event) {
            console.log(event, this);
        },

        mouseUp: function(event) {
            console.log(event, this);
        },
    })
});
