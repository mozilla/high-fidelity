HighFidelity.Router.map(function() {
    this.resource('podcasts', function() {
    });
    this.resource('podcast.new',  {path: '/podcast/new'});
    this.resource('podcast', {path: '/podcast/:podcast_id'}, function() {
        // this.route('episodes', {path: '/episodes'});
        this.route('edit');
    });
    this.resource('episode', { path: '/episode/:episode_id' });
});
