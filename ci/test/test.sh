#!/usr/bin/env bash

set -eux

pushd icompass
    export NODE_ENV=test
    npm install
    npm run btest
popd
