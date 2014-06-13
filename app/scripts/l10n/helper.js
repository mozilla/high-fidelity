Ember.Handlebars.registerHelper('t', function(property, options) {
    var params = options.hash;
    var _this = this;

    // Support variable interpolation for this string.
    Object.keys(params).forEach(function(key) {
        params[key] = Ember.Handlebars.get(_this, params[key], options);
    });

    return I18n.t(property, params);
});
