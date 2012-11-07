
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
                  title: 'Cook yummy food',
                  desc: 'COOK ALL THE THINGS',
                  date: new Date() });
    app.addItem({ id: 1,
                  title: 'Make things',
                  desc: 'Make this look like that',
                  date: new Date(12, 9, 5) });
    app.addItem({ id: 2,
                  title: 'Move stuff',
                  desc: 'Move this over there',
                  date: new Date(12, 10, 1) });

    function formatDate(d) {
        return (d.getMonth()+1) + '/' +
            d.getDate() + '/' +
            d.getFullYear();
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
        contents.children('.desc').text(model.get('desc'));
        contents.children('.date').text(formatDate(model.get('date')));
    }

    function renderEdit(view) {
        var model = view.model;
        var el = $(this.el);

        if(model) {
            el.find('input[name=id]').val(model.id);
            el.find('input[name=title]').val(model.get('title'));
            el.find('input[name=desc]').val(model.get('desc'));
        }
    }

    app.init(renderRow, renderDetail, renderEdit);
});