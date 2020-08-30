#!/usr/bin/env bash

set -e

: "${1:?}"

git flow release start next
releaseVersion=$(npm version "$1")
git commit -a -m "Release $releaseVersion"
git flow release finish next -n -m "Release $releaseVersion "

git push
git push origin master
git push --tags

echo
echo ">>> Committed and pushed $releaseVersion"
echo
