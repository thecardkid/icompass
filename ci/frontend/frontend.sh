#!/usr/bin/env bash

set -eux

pushd icompass
    export NODE_ENV=test
    npm install --quiet > /dev/null
    npm install -gq nightwatch > /dev/null

    node test/e2e/index.js
popd
