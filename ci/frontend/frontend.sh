#!/usr/bin/env bash

set -eux

pushd icompass
    pushd bin
        wget https://goo.gl/s4o9Vx
        mv s4o9Vx selenium.jar
    popd

    npm install -gq nightwatch > /dev/null

    node test/e2e/index.js
popd
