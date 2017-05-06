var mongoose = require('mongoose');

var isDev = true; //process.env.NODE_ENV !== 'production';

if (isDev) {
	mongoose.connect('mongodb://localhost/compass');
	console.log('Connected to local database');
}
var connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function(){
    console.log('Mongodb Connection Successful');
});
