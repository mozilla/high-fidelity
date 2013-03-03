#!/bin/sh

# syntax:
# extract-po.sh

# messages.po is server side strings
xgettext --keyword=l -L PHP --output-dir=locales/templates/LC_MESSAGES --from-code=utf-8 --output=messages.pot `find www/js/templates -type f -name "*.ejs"`
