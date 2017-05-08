var mongoose = require('mongoose');

var isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
	mongoose.connect('mongodb://localhost/compass');
	console.log('Connected to local database');
} else {
    mongoose.connect('mongodb://icompass:compass78@ds133311.mlab.com:33311/innovatorscompasshieu');
    console.log('Connected to Mongo Lab instance');
}
var connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function(){
    console.log('Mongodb Connection Successful');
});
