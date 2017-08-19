const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');

var HOME = path.resolve(__dirname, '../');
var PUBLIC = path.resolve(HOME, 'public/');
var SRC = path.resolve(HOME, 'src/');

const extractLess = new ExtractTextPlugin({
    filename: 'main.css',
});

module.exports = {
    devtool: 'cheap-module-source-map',
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
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            mangle: true,

            compress: {
                screw_ie8: true
            },

            output: {
                comments: false,
                beautify: false
            }
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        extractLess
    ],
    module: {
        rules: [
            {
                test: /\.jsx?/,
                include: SRC,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react', 'stage-2']
                }
            },
            {
                test: /\.less$/,
                use: extractLess.extract({
                    use: [{
                        loader: 'css-loader',
                    }, {
                        loader: 'less-loader'
                    }],
                    fallback: 'style-loader'
                })
            }
        ]
    },
    stats: {
        warnings: false,
    },
};
