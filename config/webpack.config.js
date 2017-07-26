var path = require('path');

var HOME = path.resolve(__dirname, '../');
var PUBLIC = path.resolve(HOME, 'public/');
var SRC = path.resolve(HOME, 'src/');

var config = {
    devtool: 'eval',
    entry: SRC + '/containers/App.jsx',
    output: {
        path: PUBLIC,
        filename: 'bundle.js'
    },
    resolve: {
        alias: {
            Components: path.resolve(SRC, 'components/'),
            Containers: path.resolve(SRC, 'containers/'),
            Utils: path.resolve(SRC, 'utils'),
            Actions: path.resolve(SRC, 'actions'),
            Lib: path.resolve(HOME, 'lib'),
            Models: path.resolve(HOME, 'models')
        }
    },
    module: {
        loaders: [
            {
                test: /\.jsx?/,
                include: SRC,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'react', 'stage-2']
                }
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
