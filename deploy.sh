#!/bin/bash

npm run build
git add ./dist
git commit -m "Deploy to gh-pages"
git subtree push --prefix dist git@github.com:gustavgb/gauss.git gh-pages
