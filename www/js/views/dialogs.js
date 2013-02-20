/*global _:true, App:true, Backbone:true */
/*jshint forin:false, plusplus:false, sub:true */
'use strict';

define([
    'zepto',
    'underscore',
    'backbone',
    'text!templates/subscribe-dialog.ejs'
], function($, _, Backbone, SubscribeDialogTemplate) {
    var CANCEL= 'cancel';

    var SubscribeDialogView = Backbone.View.extend({
        el: '#modal-dialog',
        $el: $('#modal-dialog'),
        template: _.template(SubscribeDialogTemplate),

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
                this.options[action]();
                this.remove();
            } else if (action && action === CANCEL) {
                this.remove();
            }
        }
    });

    return {
        Subscribe: SubscribeDialogView
    };
});
