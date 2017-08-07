const exec = require('child_process').exec;

const serverProc = exec('NODE_ENV=test node compass-server.js &');
const seleniumProc = exec('java -jar /opt/selenium/selenium-server-standalone.jar');

exec('sleep 5; nightwatch -c config/nightwatch.concourse.conf.js', function(error) {
    if (error) {
        console.error(error);
        process.exit(1)
    }
    else {
        process.exit(0);
    }
}).stdout.pipe(process.stdout);