#!/bin/bash

npm run build
rm -rf docs
mkdir docs
cp -r ./dist/* ./docs
git add ./docs
git commit -m "Deploy to gh-pages"
git push
