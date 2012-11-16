
define(function(require) {
    var $ = require('zepto');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var view = require('./view');
    var stack = view.stack;
    var Item = Backbone.Model.extend({});
    var ItemList = Backbone.Collection.extend({
        model: Item
    });

    var ListView = view.BasicView.extend({
        initialize: function() {
            this.initMarkup();
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
                                        titleField: this.options.titleField,
                                        render: this.options.renderRow,
                                        nextView: this.options.nextView,
                                        parent: this });
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
            var model = this.model;
            var titleField = this.options.titleField || 'title';

            if(this.options.render) {
                this.options.render.call(this.el, model);
            }
            else if(model.get(titleField)) {
                this.el.innerHTML = model.get(titleField);
            }
            else {
                console.log('[ListViewRow] WARNING: item does not have ' +
                            'a "title" field, the titleField property ' +
                            'is not set, and no custom ' +
                            'render function is set');
            }

            return this;
        },

        open: function() {
            var opts = this.options;
            var sel = opts.nextView || 'x-view.detail';

            var viewElement = $(sel).get(0);
            viewElement.model = this.model;
            stack.push(viewElement);
        }
    });

    xtag.register('x-listview', {
        onInsert: function() {
            this.view = new ListView({ el: this,
                                       collection: new ItemList() });

            if (this.dataset.first == 'true') {
                stack.push(this);
            }
        },
        getters: {
            'collection': function() {
                return this.view.collection;
            }
        },
        setters: {
            'titleField': function(name) {
                this.view.opts.titleField = name;
            },
            'renderRow': function(func) {
                this.view.options.renderRow = func;
            },
            'nextView': function(sel) {
                this.view.options.nextView = sel;
            },
            'collection': function(col) {
                this.view.collection = col;
            }
        },
        methods: {
            add: function(item) {
                this.view.collection.add(item);
            },
            'pop': function() {
                stack.pop();
            }
        }
    });
});