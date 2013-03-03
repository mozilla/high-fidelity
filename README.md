# high-fidelity #

high-fidelity is an offline-capable, entirely HTML5/JS podcasts app. It's
chiefly designed for FirefoxOS, but support for other platforms and browsers
is an eventual design goal. It requires a datastore that supports large files;
currently, we just use IndexedDB.

The app requires elevated XmlHttpRequest priviledges to fetch podcast files.
In FirefoxOS, this currently means being installed as a packaged app. Details
for other platforms forthcoming.

# Bugs, Feature Requests, and Love Notes #

First, check out the [list of open issues](https://bugzilla.mozilla.org/buglist.cgi?query_format=specific;order=relevance%20desc;bug_status=__open__;product=Marketplace;content=Podcasts;comments=0;comments=1;list_id=5706587).

If you want to file bugs or request features for Mozilla's Podcasts app,
please do so in [Bugzilla](https://bugzilla.mozilla.org/enter_bug.cgi?product=Marketplace&component=Reference%20Apps).
Yes, it sucks, but it's where the rest of the bugs for Mozilla's reference
apps are and it's nice to only have to use *one* issue tracker.

## Build Status ##

Continuous integration tests for high-fidelity are run on the awesome
[Travis CI](http://travis-ci.org): [![Build Status](https://secure.travis-ci.org/mozilla/high-fidelity.png?branch=master)](http://travis-ci.org/mozilla/high-fidelity)

# License #

This program is free software; it is distributed under an
[MIT License](http://github.com/mozilla/high-fidelity/blob/master/LICENSE.txt).

---

Copyright (c) 2012-2013 Mozilla.
