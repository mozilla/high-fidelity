HighFidelity.Podcast = DS.Model.extend({
    episodes: DS.hasMany('episode', {async: true}),

    name: DS.attr('string'),
    rssURL: DS.attr('string'),
    lastUpdated: DS.attr('date'),
    lastPlayed: DS.attr('date'),

    coverImageBlob: DS.attr('string'),
    coverImageURL: DS.attr('string'),

    getCoverImage: function() {
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
        this.getCoverImage();
        // this.set('lastUpdated', (new Date()));
        // this.save();

        HighFidelity.RSS.get(this.get('rssURL')).then(function(result) {
            var $xml = $(result);
            var $items = $xml.find('item');

            if (!$xml.length || !$xml.find('item').length) {
                // If we can't make sense of this podcast's feed, we delete
                // it and inform the user of the error.
                // _this.destroy();
                window.alert('Error downloading podcast feed.');
                return;
            }

            $items.each(function(i, episode) {
                var oldImageURL = _this.get('coverImageURL');

                // _this.set({
                //     imageURL: result['itunes:image'],
                //     name: result.title
                // });
                // _this.save();

                // If the cover image has changed (or this podcast is new)
                // we update the cover image.
                if (!oldImageURL ||
                    oldImageURL !== _this.get('coverImageURL')) {
                    _this.getCoverImage();
                }

                var _episodes;
                try {
                    _this.get('episodes').then(function(episodes) {
                        _episodes = episodes;

                        return episodes.filterProperty(
                            'guid', $(episode).find('guid').text()).length > 0;
                    }).then(function(episodeExists) {
                        if (episodeExists) {
                            // An episode with the same guid already exists,
                            // so don't save this one.
                            console.log('exists');
                            return;
                        }

                        var e = _episodes.store.createRecord('episode', {
                            guid: $(episode).find('guid').text(),
                            audioURL: $(episode).find('enclosure').attr('url'),
                            datePublished: $(episode).find('pubDate').text(),
                            name: $(episode).find('title').text(),
                            podcast: _this.get('model')
                        });
                        e.save();

                        // Add this episode to the list of objects; this will
                        // cause it to appear in any existing lists.
                        _episodes.addObject(e);
                    });
                } catch (err) {
                    console.error(err, _this.get('episodes'));
                }
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
        name: 'Accidental Tech Podcast',
        rssURL: 'http://atp.fm/episodes?format=rss',
        lastUpdated: (new Date()),
        lastPlayed: (new Date()),
        coverImageURL: 'http://static.squarespace.com/static/513abd71e4b0fe58c655c105/t/52c45a37e4b0a77a5034aa84/1388599866232/1500w/Artwork.jpg',
        episodes: []
    },
    {
        id: 1,
        name: 'The Cracked Podcast',
        rssURL: 'http://rss.earwolf.com/the-cracked-podcast',
        lastUpdated: (new Date()),
        lastPlayed: (new Date()),
        coverImageURL: 'http://cdn.earwolf.com/wp-content/uploads/2013/08/EAR_CrackedPodcast_1600x1600_Cover_Final.jpg',
        episodes: []
    }
];
