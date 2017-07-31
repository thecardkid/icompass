#!/usr/bin/env bash

set -eux

# Replace chromedriver with newer version
export CHROME_DRIVER_VERSION=2.31
wget --no-verbose -O /tmp/chromedriver_linux64.zip https://chromedriver.storage.googleapis.com/${CHROME_DRIVER_VERSION}/chromedriver_linux64.zip
rm -rf /opt/selenium/chromedriver-2.29
unzip /tmp/chromedriver_linux64.zip -d /opt/selenium
rm /tmp/chromedriver_linux64.zip
mv /opt/selenium/chromedriver /opt/selenium/chromedriver-${CHROME_DRIVER_VERSION}
chmod 755 /opt/selenium/chromedriver-${CHROME_DRIVER_VERSION}
ln -fs /opt/selenium/chromedriver-${CHROME_DRIVER_VERSION} /usr/bin/chromedriver

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
