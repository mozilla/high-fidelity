test:
	- rm ./test.pid
	@NODE_ENV=test PORT=3001 node server.js & echo $$! > ./test.pid & ./vendor/casperjs/bin/casperjs test --web-security=no --pre=./test/init.js ./test/test.*.js
	kill `cat ./test.pid`
	rm ./test.pid

extract_strings:
	./node_modules/ajs-xgettext/bin/ajs-xgettext --append --function=l --output=locales/templates/LC_MESSAGES/messages.pot `find www/js/templates -type f -name "*.ejs"`

npm_install:
	npm install

submodules:
	git submodule update --init --recursive

update_locale_json:
	node ./locales/compile.js

.PHONY: test
