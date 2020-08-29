#!/usr/bin/env bash

set -e

: "${1:?}"

git checkout develop
releaseVersion=$(npm version "$1" --dry-run)

echo
echo ">>> Releasing $releaseVersion"
echo ">>> Will commit and push"
echo
read -p "OK? (Ctrl-C to cancel)" -n 1 -r && echo
echo

git flow release start "$releaseVersion"
npm version $releaseVersion
git flow release finish -n

git push
git push origin master
git push --tags

echo
echo ">>> Committed and pushed $releaseVersion"
echo
