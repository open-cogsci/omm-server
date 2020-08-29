#!/usr/bin/env bash

set -e

: "${1:?}"

releaseVersion=$(npm version "$1" -m "Release v%s")

echo
echo ">>> Committed and tagged $releaseVersion"
echo ">>> Will push $releaseVersion"
echo ">>> Will commit and push new snapshot version"
echo
read -p "OK? (Ctrl-C to cancel)" -n 1 -r && echo
echo

git push
git push --tags

newVersion=$(npm version patch --git-tag-version=false)
npm version "$newVersion-SNAPSHOT" --git-tag-version=false
git add .
git commit -m "Set snapshot version $newVersion-SNAPSHOT"
git push

echo
echo ">>> Committed and pushed $releaseVersion"
echo
