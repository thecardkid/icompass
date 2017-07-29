#!/usr/bin/env bash

set -eux

cp bundle/bundle.js icompass/public
cp bundle/selenium.jar icompass/bin
cp bundle/chromedriver icompass/bin

pushd icompass
    echo "Ready!"
    node test/e2e.js
popd
