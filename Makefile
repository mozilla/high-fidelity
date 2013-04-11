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

extract_strings:
	./node_modules/ajs-xgettext/bin/ajs-xgettext --append --function=l --output=locales/templates/LC_MESSAGES/messages.pot `find www/js/templates -type f -name "*.ejs"`

npm_install:
	npm install

submodules:
	git submodule update --init --recursive

test:
	- rm ./test.pid
	@NODE_ENV=test PORT=3001 node server.js & echo $$! > ./test.pid & ./vendor/casperjs/bin/casperjs test --web-security=no --pre=./test/init.js ./test/test.*.js
	kill `cat ./test.pid`
	rm ./test.pid

update_locale_json:
	node ./locales/compile.js

.PHONY: test
