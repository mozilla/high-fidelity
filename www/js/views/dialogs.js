/*jshint forin:false, plusplus:false, sub:true */
define([
    'zepto',
    'underscore',
    'backbone',
    'tpl!templates/podcasts/delete-dialog.ejs',
    'tpl!templates/subscribe-dialog.ejs'
], function($, _, Backbone, DeletePodcastDialogTemplate, SubscribeDialogTemplate) {
    'use strict';

    // Base dialog class, used across the app for all modal dialogs/prompts.
    var DialogView = Backbone.View.extend({
        el: '#modal-dialog',
        $el: $('#modal-dialog'),

        events: {
            'click button': 'action'
        },

        initialize: function() {
            var $modal = $(this.el);

            _(this).bindAll('action');

            // If there's another dialog present, even if only in the DOM:
            // remove it.
            if ($modal.length) {
                $modal.remove();
            }

            this.el = '#modal-dialog';

            this.render();

            this.$el = $(this.el);
        },

        render: function() {
            $('body').append(this.template(this.options.templateData));
        },

        // Method used to run whatever action was selected by the user. By
        // default any action simply closes and removes the dialog modal,
        // returning the user to their previous state. A developer can supply
        // a function to run after the dialog is cleared.
        action: function(event) {
            // Determine the right method to run from the button tapped.
            var action = $(event.currentTarget).data('action');

            // The modal is always removed after any action button is tapped.
            this.remove();

            if (action && this.options[action]) {
                this.options[action]();
            }
        }
    });

    var DeletePodcastDialogView = DialogView.extend({
        template: DeletePodcastDialogTemplate
    });

    var SubscribeDialogView = DialogView.extend({
        template: SubscribeDialogTemplate
    });

    return {
        DeletePodcast: DeletePodcastDialogView,
        Subscribe: SubscribeDialogView
    };
});
