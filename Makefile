B2G_VERSION = 18
B2G_URL = http://ftp.mozilla.org/pub/mozilla.org/b2g/nightly/latest-mozilla-b2g$(B2G_VERSION)/
GAIA = test/.gaia
OS := $(shell uname -s)
URL = podcasts.gaiamobile.org

ifeq ('$(OS)','Darwin')
B2G_DOWNLOAD = $(B2G_URL)b2g-$(B2G_VERSION).0.multi.mac64.dmg
B2G_FOLDER = $(PWD)/vendor/B2G.app/Contents/MacOS
B2G_BINARY = $(B2G_FOLDER)/b2g
else
B2G_LINUX_FILENAME = b2g-$(B2G_VERSION).0.multi.linux-x86_64.tar.bz2
B2G_DOWNLOAD = $(B2G_URL)$(B2G_LINUX_FILENAME)
B2G_FOLDER = $(PWD)/b2g
B2G_BINARY = $(B2G_FOLDER)/b2g
endif

build: update_locale_json
	- rm -rf www-built
	node ./node_modules/requirejs/bin/r.js -o build-css.js
	node node_modules/requirejs/bin/r.js -o build-js.js
	mkdir -p www-built/js/lib/
	cp -R www/js/string.js www-built/js/string.js
	cp -R www/js/lib/require.js www-built/js/lib/require.js
	cp -R www/gaia www-built/gaia
	cp -R www/img www-built/img
	cp -R www/locale www-built/locale
	cp -R www/*.* www-built/
	mv www-built/css/app.built.css www-built/css/app.css
	mv www-built/js/main.built.js www-built/js/main.js
	rm www-built/gaia/style/action_menu/index.html

build_gaia:
	cd $(GAIA) && make clean && make

download_b2g_linux:
	$(shell if [ ! -d "$(B2G_FOLDER)" ]; then wget $(B2G_DOWNLOAD) && tar jxf $(B2G_LINUX_FILENAME) && mv b2g $(B2G_FOLDER); fi)

extract_strings:
	./node_modules/ajs-xgettext/bin/ajs-xgettext --append --function=l --output=locales/templates/LC_MESSAGES/messages.pot `find www/js/templates -type f -name "*.ejs"`

install_to_gaia: build
	- rm -rf $(GAIA)/apps/podcasts
	mkdir $(GAIA)/apps/podcasts
	cp -r www-built/ $(GAIA)/apps/podcasts

marketplace: build zip

prep_for_test:
	rm -rf $(B2G_FOLDER)/gaia/profile
	mkdir $(B2G_FOLDER)/gaia
	ln -s $(PWD)/$(GAIA)/profile $(B2G_FOLDER)/gaia/profile

run_tests:
	gaiatest --binary=$(B2G_BINARY) --type=b2g-antenna-bluetooth-carrier-camera-sdcard-wifi-xfail test/marionette/*.py > /dev/null

setup_gaia:
	$(shell if [ ! -d "$(GAIA)" ]; then cp -r vendor/gaia $(GAIA); fi)

submodules:
	git submodule update --init --recursive

test: setup_gaia install_to_gaia build_gaia prep_for_test run_tests

update_locale_json:
	node ./locales/compile.js

zip:
	- rm Podcasts.zip
	cd www-built && zip -r ../Podcasts.zip *
