var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'public/');
var APP_DIR = path.resolve(__dirname, 'src/');

var config = {
    devtool: 'eval',
	entry: APP_DIR + '/containers/App.jsx',
	output: {
		path: BUILD_DIR,
		filename: 'bundle.js'
	},
    resolve: {
        alias: {
            Components: path.resolve(__dirname, 'src/components/'),
            Containers: path.resolve(__dirname, 'src/containers/'),
            JsxUtils: path.resolve(__dirname, 'src/utils'),
            Utils: path.resolve(__dirname, 'utils'),
            Models: path.resolve(__dirname, 'models')
        }
    },
	module: {
		loaders: [
			{
				test: /\.jsx?/,
				include: APP_DIR,
				loader: 'babel'
			}
		],
		rules: [
			{
				test: /\.less$/,
				use: [
					'style-loader',
					{ loader: 'css-loader', options: { importLoaders: 1 } },
					'less-loader'
				]
			}
		]
	},
};

module.exports = config;
