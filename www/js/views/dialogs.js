/*global _:true, App:true, Backbone:true */
/*jshint forin:false, plusplus:false, sub:true */
'use strict';

define([
    'zepto',
    'underscore',
    'backbone',
    'tpl!templates/podcasts/delete-dialog.ejs',
    'tpl!templates/subscribe-dialog.ejs'
], function($, _, Backbone, DeletePodcastDialogTemplate, SubscribeDialogTemplate) {
    // TODO: Base a base dialog class that can be extended to reduce code
    // copying.
    var CANCEL= 'cancel';

    var DeletePodcastDialogView = Backbone.View.extend({
        el: '#modal-dialog',
        $el: $('#modal-dialog'),
        template: DeletePodcastDialogTemplate,

        events: {
            'click menu button': 'action'
        },

        initialize: function() {
            _(this).bindAll('action');

            if ($('#modal-dialog').length) {
                $('#modal-dialog').remove();
            }

            this.render();

            this.$el = $('#modal-dialog');
        },

        render: function() {
            $('body').append(this.template(this.options.templateData));
        },

        action: function(event) {
            var action = $(event.currentTarget).data('action');
            if (action && this.options[action]) {
                this.remove();
                this.options[action]();
            } else if (action && action === CANCEL) {
                this.remove();
            }
        }
    });

    var SubscribeDialogView = Backbone.View.extend({
        el: '#modal-dialog',
        $el: $('#modal-dialog'),
        template: SubscribeDialogTemplate,

        events: {
            'click menu button': 'action'
        },

        initialize: function() {
            _(this).bindAll('action');

            if ($('#modal-dialog').length) {
                $('#modal-dialog').remove();
            }

            this.render();

            this.$el = $('#modal-dialog');
        },

        render: function() {
            $('body').append(this.template(this.options.templateData));
        },

        action: function(event) {
            var action = $(event.currentTarget).data('action');
            if (action && this.options[action]) {
                this.remove();
                this.options[action]();
            } else if (action && action === CANCEL) {
                this.remove();
            }
        }
    });

    return {
        DeletePodcast: DeletePodcastDialogView,
        Subscribe: SubscribeDialogView
    };
});
