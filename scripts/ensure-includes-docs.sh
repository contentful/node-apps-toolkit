#!/usr/bin/env sh

echo ""
echo "> 📖 Checking for missing docs..."
HAS_CHANGED_DOCS=$(git status ./docs --porcelain)

if [ -z "$HAS_CHANGED_DOCS" ];
then
    echo "> ✅ Latest docs are already included in your changes. Here's a cookie! 🍪"
    echo ""
else
    echo "> 🚨 Latest docs are not included your changes. Please add them and try again"
    echo ""
    exit 1
fi