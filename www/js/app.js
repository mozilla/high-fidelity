
// This uses require.js to structure javascript:
// http://requirejs.org/docs/api.html#define

define(function(require) {
    var _ = require('underscore');

    // Installation button
    require('./install-button');

    // Write your app here.

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

    var edit = $('.edit').get(0);
    edit.render = function(item) {
        $('input[name=id]', this).val(item.id);
        $('input[name=title]', this).val(item.get('title'));
        $('input[name=url]', this).val(item.get('url'));
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
                    search.add(i);
                });
            }
        });
    });

    $('.edit button.add').click(function() {
        var el = $(edit);
        var title = el.find('input[name=title]');
        var url = el.find('input[name=url]');
        var model = edit.model;

        if (model) {
            model.set({ title: title.val(), url: url.val() });
        } else {
            list.add({ title: title,
                       url: url,
                       date: new Date() });
        }

        edit.pop();
    });

});