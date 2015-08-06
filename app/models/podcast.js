import DS from 'ember-data';
import Ember from 'ember';
import timeStamper from 'high-fidelity/lib/timestamp';
import getRSS from 'high-fidelity/lib/rss';

export default DS.Model.extend({
    episodes: DS.hasMany('episode', {async: true}),

    title: DS.attr('string'),
    description: DS.attr('string'),
    rssURL: DS.attr('string'),
    lastUpdated: DS.attr('number'),
    lastPlayed: DS.attr('number'),

    coverImageBlob: DS.attr('string'),
    coverImageURL: DS.attr('string'),

    coverImage: function() {
        if (this.get('coverImageURL')) {
            return this.get('coverImageURL');
        } else {
            return null;
        }
    }.property('coverImageBlob', 'coverImageURL'),

    destroyRecord: function() {
        console.log("This: ", this);
        console.log("Eps: ", this.get('episodes'));
        this.get('episodes').forEach(function(episode) {
            episode.destroyRecord();
        });
        return this._super();
    },

    getCoverImage: function() {
        if (!this.get('coverImageURL')) {
            console.debug('No coverImageURL found; skipping.');
            return;
        }

        var _this = this;

        var request = new XMLHttpRequest({mozSystem: true});

        request.open('GET', this.get('coverImageURL'), true);
        request.responseType = 'arraybuffer';

        request.addEventListener('load', function() {
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
        return new Ember.RSVP.Promise(function(resolve, reject) {
            // _this.getCoverImage();

            // Update last updated time so we aren't constantly looking
            // for new episodes ;-)
            _this.set('lastUpdated', timeStamper.timestamp());

            getRSS(_this.get('rssURL')).then(function(result) {
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
                _this.set('coverImageURL', $channel.find('itunes\\:image')
                                                   .attr('href'));

                console.log('Podcast record after setting data: ', _this);

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
                            datePublished: timeStamper.timestamp(
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
                            var saved = true;
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
                _this.destroyRecord().then(reject);
            });
        });
    },

    _autoUpdate: function() {
        if (this.get('lastUpdated') + 3600 < timeStamper.timestamp()) {
            console.debug('Auto update for:' + this.get('title'));
            this.update();
        }
    }.observes('lastUpdated').on('init')
});
