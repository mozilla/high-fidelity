HighFidelity.Podcast = DS.Model.extend({
    episodes: DS.hasMany('episode', {async: true}),

    name: DS.attr('string'),
    rssURL: DS.attr('string'),
    lastUpdated: DS.attr('date'),
    lastPlayed: DS.attr('date'),

    coverImageBlob: DS.attr('blob'),
    coverImageURL: DS.attr('string'),

    // episodesSorted: function() {
    //     var episodes = Ember.ArrayProxy.create({ content: Ember.A(this.get('episodes'))}).sortBy(function(a, b) {
    //         return a.get('datePublished') < b.get('datePublished');
    //     });
    //     console.log(this.get('episodes').get('firstObject'), episodes);
    //     return episodes;
    // }.property('episodes'),

    getCoverImage: function() {
        var _this = this;

        var request = new XMLHttpRequest({mozSystem: true});

        request.open('GET', this.coverImageURL, true);
        request.responseType = 'arraybuffer';

        request.addEventListener('load', function(event) {
            _this.coverImageBlob = request.response;
            _this.save();
        });

        request.send(null);
    },

    update: function(force) {

    }
});

// probably should be mixed-in...
HighFidelity.Podcast.reopen({
  attributes: function(){
    var model = this;
    return Ember.keys(this.get('data')).map(function(key){
      return Ember.Object.create({ model: model, key: key, valueBinding: 'model.' + key });
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
    episodes: [0, 1]
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
