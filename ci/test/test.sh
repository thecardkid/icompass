#!/usr/bin/env bash

set -eux

pushd icompass
    export NODE_ENV=test
    npm install --quiet > /dev/null
#    npm install -gq eslint eslint-plugin-react > /dev/null

#    npm run lint
    npm run build
#    npm run test:mocha

    npm install -q chromedriver selenium-server
popd

cp icompass/public/bundle.js bundle
cp icompass/node_modules/chromedriver/bin/chromedriver bundle
cp icompass/node_modules/selenium-server/lib/runner/selenium-server-standalone-3.4.0.jar bundle
mv bundle/selenium-server-standalone-3.4.0.jar bundle/selenium.jar
