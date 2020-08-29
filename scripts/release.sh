#!/usr/bin/env bash

set -e

: "${1:?}"

git checkout develop
releaseVersion=$(npm version "$1" -m "Release v%s" --git-tag-version=false)

echo
echo ">>> Bumped to $releaseVersion"
echo ">>> Will commit and push new snapshot version"
echo
read -p "OK? (Ctrl-C to cancel)" -n 1 -r && echo
echo

git flow release start "$releaseVersion"
git flow release finish "$releaseVersion"
git push
git push --tags

echo
echo ">>> Committed and pushed $releaseVersion"
echo
