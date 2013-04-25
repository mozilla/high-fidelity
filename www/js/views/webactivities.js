'use strict';

define([
    'zepto',
    'underscore',
    'backbone',
    'app',
    'collections/podcasts',
    'models/podcast',
    'views/dialogs',
], function($, _, Backbone, App, RSS, Podcasts, Podcast, DialogViews) {
    window.navigator.mozSetMessageHandler('activity', function(activityRequest) {
        var option = activityRequest.source;

        if (option.name === 'view') {
            window.alert('TODO: Subscribe to this URL');
        }
    });
});
