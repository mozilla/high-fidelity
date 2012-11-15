
define(function(require) {
    var $ = require('zepto');

    function Header(parent, stack) {
        parent = $(parent);
        this.stack = stack;

        if(!parent.children('header').length) {
            var first = parent.children().first();
            var header = $('<header></header>');

            if(first.is('h1')) {
                first.wrap(header);
            }
            else {
                el.prepend(header);
                header.append('<h1>Section</h1>');
            }
        }

        var el = $('header', parent);

        // Wrap the items left and right of the `h1` title
        var h1 = $('h1', el)[0];
        var els = el.children();
        var i = els.get().indexOf(h1);
        var wrapper = '<div class="navitems"></div>';

        // Yuck, the following is ugly. TODO: figure out a
        // cleaner/dryer way to do this.
        var left = els.slice(0, i);
        var leftWrapper = $(wrapper).addClass('left');
        if(left.length) {
            left.wrapAll(leftWrapper);
        }
        else {
            el.prepend(leftWrapper);
        }

        var right = els.slice(i+1, els.length);
        var rightWrapper = $(wrapper).addClass('right');
        if(right.length) {
            right.wrapAll(rightWrapper);
        }
        else {
            el.append(rightWrapper);
        }

        var _this = this;
        el.find('button').click(function() {
            if(this.dataset.view) {
                var view = $(this.dataset.view).get(0);
                view.model = parent.get(0).model;
                _this.stack.push(view);
            }
        });

        this.el = el.get(0);
    }

    Header.prototype.addBack = function() {
        var nav = $('.navitems.left', this.el);
        var stack = this.stack;

        if(!nav.children().length) {
            var back = $('<button class="back">Back</button>');
            nav.append(back);

            back.click(function() {
                stack.pop();
            });
        }
    };

    Header.prototype.setTitle = function(text) {
        var el = $(this.el);
        var title  = el.children('h1');

        var leftSize = el.children('.navitems.left').width();
        var rightSize = el.children('.navitems.right').width();
        var margin = Math.max(leftSize, rightSize);
        var width = el.width() - margin*2;

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
    };

    return Header;
});