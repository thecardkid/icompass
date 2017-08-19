const exec = require('child_process').exec;
const logger = require('../lib/logger');

exec('NODE_ENV=test node icompass.js &');
exec('java -jar /opt/selenium/selenium-server-standalone.jar');

exec('sleep 5; nightwatch -c config/nightwatch/headless.js test/e2e/*.spec.js', function(error) {
    if (error) {
        logger.error(error);
        process.exit(1);
    }
    else {
        process.exit(0);
    }
}).stdout.pipe(process.stdout);