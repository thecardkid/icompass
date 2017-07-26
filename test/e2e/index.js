const exec = require('child_process').exec;

const serverProc = exec('npm start &');
exec('sleep 5; npm run test:e2e', function(error) {
    serverProc.kill('SIGINT');
    if (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        process.exit(1);
    } else {
        process.exit(0);
    }
}).stdout.pipe(process.stdout);

// kill test runner after 2 minutes
setTimeout(function() {
    serverProc.kill('SIGINT');
    process.exit(0);
}, 2 * 60 * 1000);