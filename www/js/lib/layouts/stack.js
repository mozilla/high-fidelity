
define(function(require) {
    function ViewStack() {
    }

    ViewStack.prototype.push = function(viewDOM) {
        if(!this._stack) {
            this._stack = [];
        }

        this._stack.push(viewDOM);

        var view = viewDOM.view;
        var methods = view.stack;

        if(methods && methods.open) {
            var args = Array.prototype.slice.call(arguments, 1);
            view[methods.open].apply(view, args);
        }

        this.animatePush(viewDOM);

        if(this._stack.length > 1) {
            view.header.addBack(this);
        }

        if(view.getTitle) {
            view.header.setTitle(view.getTitle.call(view));
        }
        else {
            view.setTitle();
        }
    };

    ViewStack.prototype.animatePush = function(viewDOM) {
        viewDOM = $(viewDOM);

        if(this._stack.length > 1) {
            // For now, hardcode a slide in animation. If we end up
            // using this library a lot we can offer various animations.
            var startLeft = viewDOM.width();

            viewDOM.removeClass('moving');
            viewDOM.css({
                left: startLeft
            });

            // Triggers a layout which forces the above style to be
            // applied before the transition starts
            var forced = viewDOM[0].offsetLeft;

            viewDOM.addClass('moving');
            viewDOM.css({
                left: 0
            });
        }

        viewDOM.css({ zIndex: 100 + this._stack.length });
    };

    ViewStack.prototype.pop = function() {
        if(this._stack) {
            var viewDOM = this._stack.pop();
            var view = viewDOM.view;
            var methods = view.stack;

            if(methods && methods.close) {
                var args = Array.prototype.slice.call(arguments, 1);
                view[methods.close].apply(view, args);
            }

            $(viewDOM).css({
                // TODO: cleanup
                left: $(this._stack[this._stack.length-1]).width()
            });
        }
    };

    return ViewStack;
});