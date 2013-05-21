# high-fidelity #

high-fidelity is an offline-capable, entirely HTML5/JS podcasts app. It's
chiefly designed for Firefox OS, but support for other platforms and browsers
is an eventual design goal. It requires a datastore that supports large files;
currently, we just use IndexedDB.

The app requires elevated XMLHttpRequest privileges to fetch podcast files.
In Firefox OS, this currently means being installed as a packaged app. Details
for other platforms forthcoming.

# Bugs, Feature Requests, and Love Notes #

First, check out the [list of open issues](https://bugzilla.mozilla.org/buglist.cgi?query_format=specific;order=relevance%20desc;bug_status=__open__;product=Marketplace;content=Podcasts;comments=0;comments=1;list_id=5706587).

If you want to file bugs or request features for Mozilla's Podcasts app,
please do so in [Bugzilla](https://bugzilla.mozilla.org/enter_bug.cgi?product=Marketplace&component=Reference%20Apps).
Yes, it sucks, but it's where the rest of the bugs for Mozilla's reference
apps are and it's nice to only have to use *one* issue tracker.

## Try it out! ##

Note: You'll probably need `gettext` installed on your system to build Podcasts.
I'm not sure if the GNU version is required, but it's what I use. On a Mac, you
can get it with `brew install gettext && brew link gettext`. It's probably
the default on Linux/UNIX.

Clone the project and run:

    npm install
    make

Then add the `www-built` folder to the [Firefox OS Simulator](https://addons.mozilla.org/en-US/firefox/addon/firefox-os-simulator/).

Note that because software decoding is currently disabled, if you're using the
simulator you'll need to add a podcast with files your machine can decode. On
Mac and Linux (and possibly Windows too) this means Ogg Vorbis or WAV. MP3s
will work on all physical Firefox OS devices. Just use the [preview version](https://hacks.mozilla.org/2013/03/firefox-os-simulator-previewing-version-3-0/)
of the simulator's "push to device" functionality to try this app out on your
phone.

## Build Status ##

Continuous integration tests for high-fidelity are run on the awesome
[Travis CI](http://travis-ci.org): [![Build Status](https://secure.travis-ci.org/mozilla/high-fidelity.png?branch=master)](http://travis-ci.org/mozilla/high-fidelity)

# License #

This program is free software; it is distributed under an
[MIT License](http://github.com/mozilla/high-fidelity/blob/master/LICENSE.txt).

---

Copyright (c) 2012-2013 Mozilla.
