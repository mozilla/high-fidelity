
define(function(require) {
    var $ = require('zepto');
    var _ = require('underscore');
    var Backbone = require('backbone');

    // The default model and collection
    var Item = Backbone.Model.extend({});
    var ItemList = Backbone.Collection.extend({
        model: Item
    });

    function ViewStack(opts) {
        this.opts = opts;
    }

    ViewStack.prototype.push = function(view) {
        if(!this._stack) {
            this._stack = [];
        }

        this._stack.push(view);

        var methods = view.stack;

        if(methods && methods.open) {
            var args = Array.prototype.slice.call(arguments, 1);
            view[methods.open].apply(view, args);
        }

        if(this.opts.onPush) {
            this.opts.onPush.call(this, view);
        }
    };

    ViewStack.prototype.pop = function() {
        if(this._stack) {
            var view = this._stack.pop();
            var methods = view.stack;

            if(this.opts.onPop) {
                this.opts.onPop.call(this, view);
            }

            if(methods && methods.close) {
                var args = Array.prototype.slice.call(arguments, 1);
                view[methods.close].apply(view, args);
            }
        }
    };


    var stack = new ViewStack({
        onPush: function(view) {
            var section = $(view.el);

            if(this._stack.length > 1) {
                section.css({
                    left: section.width()
                });

                setTimeout(function() {
                    section.addClass('moving');
                    section.css({
                        left: 0
                    });
                }, 0);
            }

            section.css({ zIndex: 100 + this._stack.length });

            if(view.getTitle) {
                $('header h1', section).text(view.getTitle.call(view));
            }

            if(this._stack.length > 1) {
                var nav = $('.navitems.left', section);
                if(!nav.children().length) {
                    nav.append('<button class="back">Back</button>');
                }
            }

            if(this._stack.length <= 1) {
                $('.navitems.left button.back', section).remove();
            }

            centerTitle(section);
        },

        onPop: function(view) {
            var section = $(view.el);
            section.css({
                left: section.width()
            });

            //var last = this._stack[this._stack.length-1];
        }
    });

    var EditView = Backbone.View.extend({
        events: {
            'click button.add': 'save'
        },

        stack: {
            'open': 'open'
        },

        getTitle: function() {
            return 'Editing: ' + this.model.get('title');
        },

        open: function(item) {
            this.model = item;

            var el = $(this.el);
            if(item === undefined || item === null) {
                el.find('input').val('');
            }

            if(this.options.render) {
                this.options.render(this);
            }
        },

        back: function() {
            stack.pop();
        },

        save: function() {
            var el = $(this.el);
            var id = el.find('input[name=id]');
            var title = el.find('input[name=title]');
            var url = el.find('input[name=url]');

            if(id.val()) {
                var model = itemList.get(id.val());
                model.set({ title: title.val(),
                            url: url.val() });
            }
            else {
                itemList.add(new itemList.model({ id: itemList.length,
                                                  title: title.val(),
                                                  url: url.val(),
                                                  date: new Date() }));
            }

            stack.pop();
        }
    });

    var DetailView = Backbone.View.extend({
        events: {
            'click button.edit': 'edit'
        },

        stack: {
            'open': 'open'
        },

        getTitle: function() {
            return this.model.get('title');
        },

        open: function(item) {
            this.model = item;

            // Todo: don't bind this multiple times
            this.model.on('change', _.bind(this.render, this));
            this.render();
        },

        edit: function() {
            //window.location.hash = '#edit/' + this.model.id;
            stack.push(editView, this.model);
        },

        render: function() {
            if(this.options.render) {
                this.options.render(this);
            }
        }
    });

    var ListView = Backbone.View.extend({
        initialize: function() {
            this.collection.bind('add', _.bind(this.appendItem, this));

            $('.contents', this.el).append('<ul class="_list"></ul>');
            this.render();
        },

        render: function() {
            $('._list', this.el).html('');

            _.each(this.collection.models, function(item) {
                this.appendItem(item);
            }, this);
        },

        appendItem: function(item) {
            var row = new ListViewRow({ model: item,
                                        render: this.options.render });
            $('._list', this.el).append(row.render().el);
        }
    });

    var ListViewRow = Backbone.View.extend({
        tagName: 'li',

        events: {
            'click': 'open'
        },

        initialize: function() {
            this.model.on('change', _.bind(this.render, this));
        },

        render: function() {
            if(this.options.render) {
                this.options.render(this);
            }
            return this;
        },

        open: function() {
            //window.location.hash = '#details/' + this.model.id;
            stack.push(detailView, itemList.get(this.model.id));
        }
    });

    $('header button.add').click(function() {
        stack.push(editView);
    });

    $('header button.back').live('click', function() {
        stack.pop();
    });

    var Workspace = Backbone.Router.extend({
        routes: {
            "": "todos",
            "details/:id": "details",
            "edit/:id": "edit",
            "new": "new_"
        },

        todos: function() {
        },

        details: function(id) {
        },

        edit: function(id) {
        },

        new_: function() {
        }
    });

    window.app = new Workspace();
    Backbone.history.start();

    function centerTitle(section) {
        var header = section.children('header');
        var leftSize = header.children('.navitems.left').width();
        var rightSize = header.children('.navitems.right').width();
        var margin = Math.max(leftSize, rightSize);
        var width = section.width() - margin*2;
        var title = header.children('h1');

        var text = title.text();

        if(text.length > 22) {
            text = text.slice(0, 22) + '...';
        }

        var fontSize;
        if(text.length <= 5) {
            fontSize = 20;
        }
        else if(text.length >= 25) {
            fontSize = 11;
        }
        else {
            var l = text.length - 5;
            var i = 1 - l / 20;

            fontSize = 11 + (20 - 11) * i;
        }

        title.text(text);
        title.css({ left: margin,
                    width: width,
                    fontSize: fontSize + 'pt' });
    }

    function initUI() {
        $('#app > section').show();

        $('section > header').each(function() {
            var header = $(this);
            var h1 = $('h1', header)[0];
            var els = header.children();
            var i = els.get().indexOf(h1);
            var wrapper = '<div class="navitems"></div>';

            els.slice(0, i).wrapAll($(wrapper).addClass('left'));
            els.slice(i+1, els.length).wrapAll($(wrapper).addClass('right'));
        });

        var appHeight = $('#app').height();

        $('#app > section').each(function() {
            var el = $(this);
            el.width($('body').width());

            if(!el.children('header').length) {
                var first = el.children().first();
                var header = $('<header></header>');

                if(first.is('h1')) {
                    first.wrap(header);
                }
                else {
                    el.prepend(header);
                    header.append('<h1>section</h1>');
                }
            }

            var header = $('header', el);
            if(!header.children('.navitems.left').length) {
                header.prepend('<div class="navitems left"></div>');
            }

            if(!header.children('.navitems.right').length) {
                header.append('<div class="navitems right"></div>');
            }

            var header = el.children('header').remove();

            var contents = el.children();
            if(!contents.length) {
                el.append('<div class="contents"></div>');
            }
            else {
                contents.wrapAll('<div class="contents"></div>');
            }
            el.prepend(header);

            var height = el.children('header').height();
            el.children('.contents').css({ height: appHeight - height });
        });
    }

    var editView, detailView, listView;
    var itemList = new ItemList();

    return {
        init: function(renderRow, renderDetail, renderEdit) {
            initUI();

            editView = new EditView({ el: $('#app > section.edit'),
                                      render: renderEdit});

            detailView = new DetailView({ el: $('#app > section.detail'),
                                          render: renderDetail });

            listView = new ListView({ collection: itemList,
                                      el: $('#app > section.list'),
                                      render: renderRow });

            stack.push(listView);
            centerTitle($(listView.el));
        },

        addItem: function(item) {
            itemList.add(item);
        },

        setItems: function(collection) {
            itemList = collection;
        },

        Item: Item
    };
});
