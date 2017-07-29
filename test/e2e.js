const exec = require('child_process').exec;

const serverProc = exec('npm start &');
const seleniumProc = exec('java -jar bin/selenium.jar &');

exec('sleep 5; nightwatch -c config/nightwatch.conf.js', function(error) {
    serverProc.kill('SIGINT');
    seleniumProc.kill('SIGINT');
    if (error) {
        console.error(error);
        process.exit(1)
    }
    else {
        process.exit(0);
    }
}).stdout.pipe(process.stdout);