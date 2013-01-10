/*global _:true, App:true, Backbone:true */
/*jshint forin:false, plusplus:false, sub:true */
'use strict';

define([
    'zepto',
    'underscore',
    'backbone',
    'app',
    'collections/episodes',
    'collections/podcasts',
    'models/episode',
    'models/podcast',
    'text!templates/player.ejs'
], function($, _, Backbone, App, Episodes, Podcasts, Episode, Podcast, PlayerTemplate) {
    var PlayerView = Backbone.View.extend({
        className: 'player',
        el: '#player',
        $el: $('#player'),
        model: Episode,
        template: _.template(PlayerTemplate),

        events: {

        },

        initialize: function() {
            this.getEpisode();

            this.render();
        },

        render: function() {
            var html = this.template({
                blobURL: this.options.blobURL,
                episode: this.model
            });

            this.$el.html(html);
        },

        downloadEpisode: function() {
            var self = this;

            var request = new window.XMLHttpRequest();

            request.open('GET', this.model.get('enclosure').url, true);
            request.responseType = 'blob';

            request.addEventListener('load', function(event) {
                self.model.blob(request.response, self.render);
            });

            request.send(null);
        },

        getEpisode: function() {
            var self = this;

            this.model.blob(function(podcast) {
                if (podcast && podcast.file) {
                    console.log('exists!', podcast.file);
                    try {
                        self.options.blobURL = window.URL.createObjectURL(podcast.file);
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    self.downloadEpisode();
                }

                self.render();
            });
        }
    });

    return PlayerView;
});
