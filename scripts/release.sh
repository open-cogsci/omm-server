#!/usr/bin/env bash

set -e

: "${1:?}"

git flow release start next
releaseVersion=$(npm version "$1" --git-tag-version=false)
git flow release finish -T "$releaseVersion" -m "Release $releaseVersion" next

git push
git push origin master
git push --tags

echo
echo ">>> Committed and pushed $releaseVersion"
echo
