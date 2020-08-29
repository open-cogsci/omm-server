#!/usr/bin/env bash

set -e

: "${1:?}"

git checkout develop
releaseVersion=$(npm version "$1" --git-tag-version=false)

echo
echo ">>> Bumped to $releaseVersion"
echo ">>> Will commit and push new snapshot version"
echo
read -p "OK? (Ctrl-C to cancel)" -n 1 -r && echo
echo

git commit -a -m "Preparing v$releaseVersion"
git flow release start "$releaseVersion"
git flow release finish -n

git push
git push origin master
git push --tags

echo
echo ">>> Committed and pushed $releaseVersion"
echo
