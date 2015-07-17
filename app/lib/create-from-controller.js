(function() {
    'use strict';

    EmberHifi.createFromController = function(controller, rssURL) {
        console.debug('Find podcast with rssURL:', rssURL);
        var existingPodcast = controller.store.find('podcast', {
            rssURL: rssURL
        }).then(function(podcast) {
            console.info('Podcast already exists', podcast.objectAt(0));

            controller.set('isAdding', false);
            controller.set('rssURL', '');
            controller.transitionToRoute('podcast', podcast.objectAt(0));
        }, function() {
            console.info('Creating new podcast.');

            var podcast = controller.store.createRecord('podcast', {
                rssURL: rssURL
            });

            podcast.update().then(function() {
                controller.set('isAdding', false);
                controller.set('rssURL', '');
                controller.transitionToRoute('podcast', podcast);
            }, function() {
                controller.set('isAdding', false);
                controller.set('isInErrorState', true);
            });
        });
    };

})();
