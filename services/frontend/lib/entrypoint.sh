#! /bin/sh

fileTmpEnvSed="/tmp/env.sed"
dirRoot="/var/www/html"
fileHttpdConf="/lib/httpd.conf"

echo "performing replacements..."

env | grep "^STATIC_" |sed -r 's|^([^=]+)=(.*)$|s\|\1\|\2\|g|g' >"$fileTmpEnvSed"

find "$dirRoot" -type f -print0 |xargs -0 sed -i -f "$fileTmpEnvSed"
rm "$fileTmpEnvSed"
echo "starting httpd server..."

httpd -f -h "$dirRoot" -p 80 -c "$fileHttpdConf"
