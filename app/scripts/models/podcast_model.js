HighFidelity.Podcast = DS.Model.extend({
    episodes: DS.hasMany('episode', {async: true}),

    title: DS.attr('string'),
    description: DS.attr('string'),
    rssURL: DS.attr('string'),
    lastUpdated: DS.attr('number'),
    lastPlayed: DS.attr('number'),

    coverImageBlob: DS.attr('string'),
    coverImageURL: DS.attr('string'),

    // Podcast initialization; mostly used to check for new episodes.
    // init: function() {
    //     this._super();
    //     console.info('init for podcast:' + this.get('id'),
    //                  this.get('lastUpdated'), this);
    //
    //     if (this._needsUpdate) {
    //         console.log('Updating podcast -- ', this.get('lastUpdated'));
    //         this.update();
    //     }
    // },

    coverImage: function() {
        // if (this.get('coverImageBlob')) {
        //     return null;
        // } else
        //
        if (this.get('coverImageURL')) {
            return this.get('coverImageURL');
        } else {
            return null;
        }
    }.property('coverImageBlob', 'coverImageURL'),

    destroyRecord: function() {
        var _this = this;
        this.get('episodes').forEach(function(episode) {
            // if (episode.get('isPlaying')) {
            //     _this.get('controllers.player').send('setEpisode', null);
            // }
            episode.destroyRecord();
        });
        return this._super();
    },

    getCoverImage: function() {
        //return;
        if (!this.get('coverImageURL')) {
            console.debug('No coverImageURL found; skipping.');
            return;
        }

        var _this = this;

        var request = new XMLHttpRequest({mozSystem: true});

        request.open('GET', this.get('coverImageURL'), true);
        request.responseType = 'arraybuffer';

        request.addEventListener('load', function(event) {
            _this.set('coverImageBlob', request.response);
            _this.save();
        });

        try {
            request.send(null);
        } catch (err) {
            console.error(err);
        }
    },

    // Update this podcast from the RSS feed, but don't download any
    // new episodes by default.
    update: function() {
        var _this = this;

        console.info('Updating podcast:' + this.get('id'));
        return new Promise(function(resolve, reject) {
            // _this.getCoverImage();

            // Update last updated time so we aren't constantly looking for new
            // episodes ;-)
            _this.set('lastUpdated', HighFidelity.timestamp());

            HighFidelity.RSS.get(_this.get('rssURL')).then(function(result) {
                var $xml = $(result);
                var $channel = $xml.find('channel');
                var $items = $xml.find('item');
                var saved = false;

                if (!$xml.length || !$xml.find('item').length) {
                    // If we can't make sense of this podcast's feed, we delete
                    // it and inform the user of the error.
                    window.alert('Error downloading podcast feed.');
                    return;
                }

                _this.set('title', $channel.find('title').eq(0).text());
                _this.set('description', $channel.find('description')
                                                 .eq(0).text());
                _this.set('coverImageURL', $channel.find('itunes\\:image')
                                                   .attr('href'));

                _this.get('episodes').then(function(episodes) {
                    var itemsSaved = 0;
                    $items.each(function(i, episode) {
                        var guid = $(episode).find('guid').text();

                        if (episodes.filterBy('guid', guid).length) {
                            return;
                        }

                        var oldImageURL = _this.get('coverImageURL');

                        // Use the latest artwork for the cover image.
                        var episodeImageURL = $(episode).find('itunes\\:image')
                                                        .attr('href');
                        console.log('episodeImage', episodeImageURL);
                        if (i === 0 && episodeImageURL !== oldImageURL) {
                            _this.set('coverImageURL', episodeImageURL);
                        }

                        // If the cover image has changed (or this podcast is
                        // new) we update the cover image.
                        if (!oldImageURL ||
                            oldImageURL !== _this.get('coverImageURL')) {
                            // _this.getCoverImage();
                        }

                        var e = _this.store.createRecord('episode', {
                            guid: guid,
                            audioURL: $(episode).find('enclosure').attr('url'),
                            datePublished: HighFidelity.timestamp(
                                $(episode).find('pubDate').text()
                            ),
                            name: $(episode).find('title').text(),
                            podcast: _this
                        });

                        // Add this episode to the list of objects; this will
                        // cause it to appear in any existing lists.
                        e.save();
                        episodes.pushObject(e);

                        itemsSaved++;

                        if ($items.length === i + 1) {
                            console.info('Updated podcast:' + _this.get('id'),
                                         itemsSaved + ' new episodes.');
                            saved = true;
                            _this.save().then(resolve);
                        }
                    });

                    if (!itemsSaved && !$items.length && !saved) {
                        console.info('Updated podcast:' + _this.get('id'),
                                     itemsSaved + ' new episodes.');
                        _this.save().then(resolve);
                    }
                });
            }, function(error) {
                console.error('Could not download podcast', error);
                _this.destroyRecord();
            });
        });
    },

    _autoUpdate: function() {
        if (this.get('lastUpdated') + 3600 < HighFidelity.timestamp()) {
            console.debug('Auto update for:' + this.get('title'));
            this.update();
        }
    }.observes('lastUpdated').on('init')
});

HighFidelity.Podcast.createFromController = function(controller, rssURL) {
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
        });
    });
};

// delete below here if you do not want fixtures
HighFidelity.Podcast.FIXTURES = [
    {
        id: 0,
        title: 'Accidental Tech Podcast',
        rssURL: 'http://atp.fm/episodes?format=rss',
        lastUpdated: 234,
        lastPlayed: 200,
        coverImageURL: 'http://static.squarespace.com/static/513abd71e4b0fe58c655c105/t/52c45a37e4b0a77a5034aa84/1388599866232/1500w/Artwork.jpg',
        episodes: [0]
    },
    {
        id: 1,
        title: 'The Cracked Podcast',
        rssURL: 'http://rss.earwolf.com/the-cracked-podcast',
        lastUpdated: 247724,
        lastPlayed: 24742,
        coverImageURL: 'http://cdn.earwolf.com/wp-content/uploads/2013/08/EAR_CrackedPodcast_1600x1600_Cover_Final.jpg',
        episodes: []
    }
];
