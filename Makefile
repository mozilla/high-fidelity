# B2G_BINARY = './vendor/B2G.app/Contents/MacOS/b2g'
B2G_VERSION = 18
B2G_URL = http://ftp.mozilla.org/pub/mozilla.org/b2g/nightly/latest-mozilla-b2g$(B2G_VERSION)/
USER_PREF = user_pref("marionette.force-local", true);
URL = podcasts.gaiamobile.org
OS := $(shell uname -s)

ifeq ('$(OS)','Darwin')
B2G_DOWNLOAD = $(B2G_URL)b2g-$(B2G_VERSION).0.multi.mac64.dmg
B2G_FOLDER = $(PWD)/vendor/B2G.app/Contents/MacOS
B2G_BINARY = $(B2G_FOLDER)/b2g
else
B2G_LINUX_FILENAME = b2g-$(B2G_VERSION).0.multi.linux-x86_64.tar.bz2
B2G_DOWNLOAD = $(B2G_URL)$(B2G_LINUX_FILENAME)
B2G_FOLDER = $(PWD)/.b2g
B2G_BINARY = $(B2G_FOLDER)/b2g
endif

build:
	- rm -rf www-built
	node ./node_modules/requirejs/bin/r.js -o optimizeCss='standard.keeplines' cssIn=./www/css/app.css out=./www-built/css/app.built.css
	node node_modules/requirejs/bin/r.js -o build.js
	mkdir -p www-built/js/lib/
	cp -R www/js/string.js www-built/js/string.js
	cp -R www/js/lib/require.js www-built/js/lib/require.js
	cp -R www/gaia www-built/gaia
	cp -R www/img www-built/img
	cp -R www/locale www-built/locale
	cp -R www/*.* www-built/
	mv www-built/css/app.built.css www-built/css/app.css
	mv www-built/js/main.built.js www-built/js/main.js

build_gaia:
	cd vendor/gaia && make clean && make

download_b2g_linux:
	wget $(B2G_DOWNLOAD)
	tar jxf $(B2G_LINUX_FILENAME)

extract_strings:
	./node_modules/ajs-xgettext/bin/ajs-xgettext --append --function=l --output=locales/templates/LC_MESSAGES/messages.pot `find www/js/templates -type f -name "*.ejs"`

install_to_gaia: build
	- rm -rf vendor/gaia/apps/podcasts
	mkdir vendor/gaia/apps/podcasts
	cp -r www-built/ vendor/gaia/apps/podcasts

prep_for_test:
	rm -rf $(B2G_FOLDER)/gaia/profile
	ln -s $(PWD)/vendor/gaia/profile $(B2G_FOLDER)/gaia/profile
	echo '\n$(USER_PREF)' >> vendor/gaia/profile/user.js

run_tests:
	gaiatest --binary=$(B2G_BINARY) --type=b2g-antenna-bluetooth-carrier-camera-sdcard-wifi-xfail test/marionette/*.py > /dev/null

submodules:
	git submodule update --init --recursive

test: install_to_gaia build_gaia prep_for_test run_tests

test_travis: download_b2g test

update_locale_json:
	node ./locales/compile.js

.PHONY: test
