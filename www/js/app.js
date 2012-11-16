
// This uses require.js to structure javascript:
// http://requirejs.org/docs/api.html#define

define(function(require) {
    var _ = require('underscore');

    // Installation button
    require('./install-button');

    require('layouts/view');
    require('layouts/list');

    function formatDate(d) {
        return (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear();
    }

    var stack = require('layouts/view').stack;

    var list = $('.list').get(0);
    list.add({ id: 0,
               title: 'JFK Berlin Address',
               url: 'http://upload.wikimedia.org/wikipedia/commons/3/3a/Jfk_berlin_address_high.ogg',
               date: new Date() });

    var detail = $('.detail').get(0);
    detail.render = function(item) {
        $('.title', this).text(item.get('title'));
        $('.url', this).text(item.get('url'));
        $('.date', this).text(formatDate(item.get('date')));

        $('.play', this).empty().append(
            $('<audio controls>').attr('src', item.get('url')));
    };

    var search = $('.search').get(0);
    $('.list button.add').click(function() {
        stack.push(search);
    });
    $('.search form').submit(function(e) {
        e.preventDefault();
        $.ajaxJSONP({
            url: ('https://gpodder.net/search.jsonp?jsonp=?&q=' +
                  encodeURIComponent($('.search input').val())),
            success: function(data) {
                search.collection.reset();
                $('.search ._list').html(''); // XXX ListView should do that when collection is emptied
                _.each(data, function(i) {
                    if (!i.title.length) return;
                    search.add({
                        title: i.title,
                        desc: i.description,
                        url: i.url,
                        logo: i.scaled_logo_url
                    });
                });
            }
        });
    });

    var result = $('.result').get(0);
    result.render = function(item) {
        $('.title', this).text(item.get('title'));
        $('.desc', this).text(item.get('desc'));
        $('.logo', this).attr('src', item.get('logo'));
    };
    search.nextView = result;

});
