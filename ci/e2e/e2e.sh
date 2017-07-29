#!/usr/bin/env bash

set -eux

pushd icompass
    npm install -q > /dev/null
    npm install -gq nightwatch > /dev/null
#    npm install -gq eslint eslint-plugin-react > /dev/null

#    npm run lint
    npm run build
#    npm run test:mocha

    echo "Ready!"
    node test/e2e.js
popd
