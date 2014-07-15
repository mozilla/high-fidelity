var HighFidelity = window.HighFidelity = Ember.Application.create({
    LOG_TRANSITIONS: true
});

// Order and include as you please.
require('scripts/lib/*');

// TODO: Check this somehow?
HighFidelity.MozApps.checkIfPackaged(HighFidelity);

require('scripts/l10n/*');
require('scripts/helpers/*');
require('scripts/controllers/*');
require('scripts/store');
require('scripts/models/*');
require('scripts/routes/*');
require('scripts/views/*');
require('scripts/router');
