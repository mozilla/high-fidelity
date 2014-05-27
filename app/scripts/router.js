HighFidelity.Router.map(function () {

    // this.resource('episodes', function() {
    //     this.resource('episode', { path: '/:episode_id' }, function() {
    //         this.route('edit');
    //     });
    //     this.route('create');
    // });

    this.resource('podcasts', function() {
        this.route('create');
    });
    this.resource('podcast', { path: '/podcasts/:podcast_id' }, function() {
        // this.route('episodes', {path: '/episodes'});
        this.route('edit');
    });
    this.resource('episode', { path: '/episode/:episode_id' });

});
