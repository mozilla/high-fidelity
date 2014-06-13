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
    init: function() {
        this._super();

        if (!this.get('lastUpdated') ||
            this.get('lastUpdated') + 3600 < HighFidelity.timestamp()) {
            console.log('Updating podcast -- ', this.get('lastUpdated'));
            // this.update();
        }
    },

    coverImage: function() {
        if (this.get('coverImageBlob')) {
            return null;
        } else if (this.get('coverImageURL')) {
            return this.get('coverImageURL');
        } else {
            return null;
        }
    }.property('coverImageBlob', 'coverImageURL'),

    getCoverImage: function() {
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

        return new Promise(function(resolve, reject) {
            // _this.getCoverImage();

            // Update last updated time so we aren't constantly looking for new
            // episodes ;-)
            _this.set('lastUpdated', HighFidelity.timestamp());

            HighFidelity.RSS.get(_this.get('rssURL')).then(function(result) {
                var $xml = $(result);
                var $channel = $xml.find('channel');
                var $items = $xml.find('item');

                if (!$xml.length || !$xml.find('item').length) {
                    // If we can't make sense of this podcast's feed, we delete
                    // it and inform the user of the error.
                    window.alert('Error downloading podcast feed.');
                    return;
                }

                _this.set('title', $channel.find('title').eq(0).text());
                _this.set('description', $channel.find('description')
                                                 .eq(0).text());

                $items.each(function(i, episode) {
                    var oldImageURL = _this.get('coverImageURL');

                    // Use the latest artwork for the cover image.
                    if (i === 0) {
                        _this.set('coverImageURL',
                                  $(episode).find('itunes\\:image')
                                            .attr('href'));
                    }

                    _this.save();

                    // If the cover image has changed (or this podcast is new)
                    // we update the cover image.
                    if (!oldImageURL ||
                        oldImageURL !== _this.get('coverImageURL')) {
                        _this.getCoverImage();
                    }

                    var _episodes;
                    _this.get('episodes').then(function(episodes) {
                        _episodes = episodes;

                        return episodes.filterProperty(
                            'guid', $(episode).find('guid').text()).length > 0;
                    }).then(function(episodeExists) {
                        if (episodeExists) {
                            // An episode with the same guid already exists,
                            // so don't save this one.
                            console.debug('Episodes already exists.');
                            return;
                        }

                        var e = _episodes.store.createRecord('episode', {
                            guid: $(episode).find('guid').text(),
                            audioURL: $(episode).find('enclosure').attr('url'),
                            datePublished: HighFidelity.timestamp(
                                $(episode).find('pubDate').text()
                            ),
                            name: $(episode).find('title').text(),
                            podcast: _this.get('model')
                        });
                        e.save();

                        // Add this episode to the list of objects; this will
                        // cause it to appear in any existing lists.
                        _episodes.addObject(e);
                    }).then(resolve);
                });
            }, function(error) {
                console.error('Could not download podcast:', error);
                _this.destroyRecord();
            });
        });
    }
});

// probably should be mixed-in...
HighFidelity.Podcast.reopen({
    attributes: function(){
        var model = this;
        return Ember.keys(this.get('data')).map(function(key){
            return Ember.Object.create({
                model: model,
                key: key,
                valueBinding: '  model.' + key
            });
        });
    }.property()
});

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
