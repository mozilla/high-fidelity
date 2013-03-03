#!/bin/bash

lang=$1

if [ -z "$lang" ]; then
	echo ""
	echo "Usage: ./newlocal.sh \$LANG_CODE"
	echo ""
	echo "Please supply one argument: the language code of the locale you want to create."
	echo ""
	echo "example:"
	echo "                ./locales/newlocal.sh en-US"
	echo ""
	echo "To create a new locale messages.po for US English"
	echo ""
	exit;
fi

mkdir -p locales/$lang/LC_MESSAGES/
msginit --locale=$lang --input=locales/templates/LC_MESSAGES/messages.pot --output=locales/$lang/LC_MESSAGES/messages.po
