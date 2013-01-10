/*global _:true, App:true, Backbone:true */
/*jshint forin:false, plusplus:false, sub:true */
'use strict';

define([
    'zepto',
    'underscore',
    'backbone',
    'app',
    'collections/podcasts',
    'models/podcast',
    'views/episode',
    'text!templates/podcast.ejs'
], function($, _, Backbone, App, Podcasts, Podcast, EpisodeView, PodcastTemplate) {
    var PodcastView = Backbone.View.extend({
        className: 'podcast',
        el: '#podcasts',
        $el: $('#podcasts'),
        model: Podcast,
        tagName: 'li',
        template: _.template(PodcastTemplate),

        events: {

        },

        initialize: function() {
            var self = this;

            if (!this.model.get('id')) {
                Podcasts.add(this.model);
                this.model.save();
            }

            this.model.update(function() {
                self.render();
            });

            this.render();
        },

        render: function() {
            var html = this.template({
                podcast: this.model
            });

            var podcast = this.$el.children('#podcast-{id}'.format({
                id: this.model.get('id')}
            ));

            if (podcast.length) {
                podcast.html(html);
            } else {
                this.$el.append(html);
            }

            this.model.episodes().forEach(function(episode) {
                var view = new EpisodeView({
                    model: episode
                });
            });
        }
    });

    return PodcastView;
});
