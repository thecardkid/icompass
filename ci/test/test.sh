#!/usr/bin/env bash

set -eux

pushd icompass
    export NODE_ENV=test
    npm install --quiet > /dev/null
    npm install -gq eslint eslint-plugin-react > /dev/null

    npm run lint
    npm run build
    npm run test:mocha
popd
