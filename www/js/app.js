
// This uses require.js to structure javascript:
// http://requirejs.org/docs/api.html#define

define(function(require) {
    // Receipt verification (https://github.com/mozilla/receiptverifier)
    require('receiptverifier');

    // Installation button
    require('./install-button');

    // Write your app here.

    $('.delete').click(function() {});

    var app = require('./list-detail');

    app.addItem({ id: 0,
                  title: 'JFK Berlin Address',
                  url: 'http://upload.wikimedia.org/wikipedia/commons/3/3a/Jfk_berlin_address_high.ogg',
                  date: new Date() });

    function formatDate(d) {
        return (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear();
    }

    function renderRow(view) {
        var model = view.model;
        view.el.innerHTML = model.get('title') + ' - ' +
            '<strong>' + formatDate(model.get('date')) + '</strong>';
    }

    function renderDetail(view) {
        var model = view.model;
        var contents = $('.contents', view.el);

        contents.children('.title').text(model.get('title'));
        contents.children('.url').text(model.get('url'));
        contents.children('.date').text(formatDate(model.get('date')));

        contents.children('.play').empty().append(
            $('<audio controls>').attr('src', model.get('url'))
        );
    }

    function renderEdit(view) {
        var model = view.model;
        var el = $(this.el);

        if(model) {
            el.find('input[name=id]').val(model.id);
            el.find('input[name=title]').val(model.get('title'));
            el.find('input[name=url]').val(model.get('url'));
        }
    }

    app.init(renderRow, renderDetail, renderEdit);
});