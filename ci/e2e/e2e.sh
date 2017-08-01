#!/usr/bin/env bash

set -eux

pushd icompass
    npm install -q > /dev/null
    npm run build
    node test/e2e.js
popd
