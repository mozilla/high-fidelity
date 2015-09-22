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

    coverImageURL: DS.attr('string'),

    destroyRecord: function() {
        var self = this;
        var removeEpisodes = function() {
            self.get('episodes').forEach(function(episode) {
                if (episode) {
                    episode.destroyRecord();
                } else {
                    removeEpisodes();
                }
            });
        };
        removeEpisodes();

        return this._super();
    },

    // Update this podcast from the RSS feed, but don't download any
    // new episodes by default.
    update: function() {
        var _this = this;

        console.info('Updating podcast:' + this.get('id'));
        return new Ember.RSVP.Promise(function(resolve, reject) {
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
                _this.set('coverImageURL',
                  $channel.children('itunes\\:image, image').attr('href'));

                _this.get('episodes').then(function(episodes) {
                    var itemsSaved = 0;
                    var saved = false;
                    $items.each(function(i, episode) {
                        var guid = $(episode).find('guid').text();

                        if (episodes.filterBy('guid', guid).length) {
                            return;
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
