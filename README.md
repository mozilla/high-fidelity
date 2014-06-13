# high-fidelity, Mark II #

This is an experimental, rewrite branch using Ember.js and Mozilla's recroom.

high-fidelity is an offline-capable, entirely HTML5/JS podcasts app. It's
chiefly designed for Firefox OS, but support for other platforms and browsers
is an eventual design goal. It requires a datastore that supports large files;
currently, we just use IndexedDB.

The app requires elevated XMLHttpRequest privileges to fetch podcast files.
In Firefox OS, this currently means being installed as a packaged app. Details
for other platforms forthcoming.

# License #

This program is free software; it is distributed under an [MIT License][].

---

Copyright (c) 2012-2014 Mozilla ([Contributors][]).

[Contributors]: https://github.com/mozilla/high-fidelity/graphs/contributors
[MIT License]: https://github.com/mozilla/high-fidelity/blob/master/LICENSE
