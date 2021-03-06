#!/usr/bin/env bash

set -e

: "${1:?}"

git flow release start next
releaseVersion=$(npm version "$1" --git-tag-version=false)
git commit -a -m "Bump to $releaseVersion"
# Remove the v from the tag because Git flow adds it again
releaseVersion=${releaseVersion#?};
git flow release finish -T "$releaseVersion" -m "Release " next

git push
git push origin master
git push --tags

echo
echo ">>> Committed and pushed $releaseVersion"
echo
