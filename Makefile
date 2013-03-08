extract_strings:
	./node_modules/ajs-xgettext/bin/ajs-xgettext --append --function=l --output=locales/templates/LC_MESSAGES/messages.pot `find www/js/templates -type f -name "*.ejs"`

update_locale_json:
	node ./locales/compile.js
