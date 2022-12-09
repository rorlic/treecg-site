#!/bin/bash

# install node dependencies
npm install

# install ruby dependencies
bundle install

# fetch rdf data
node bin/fetchData.js fetch ./config.json

# build server
bundle exec jekyll build
