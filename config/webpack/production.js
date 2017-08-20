let webpack = require('webpack');
let CompressionPlugin = require('compression-webpack-plugin');
let path = require('path');

let HOME = path.resolve(__dirname, '../../');
let PUBLIC = path.resolve(HOME, 'public/');
let SRC = path.resolve(HOME, 'src/');

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
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            mangle: true,

            compress: {
                warnings: false,
                screw_ie8: true
            },

            output: {
                comments: false,
                beautify: false
            },

            exclude: [/\.min\.js$/gi] // skip pre-minified libs
        }),
        new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0
        })
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
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader', options: { importLoaders: 1 } },
                    { loader: 'less-loader' }
                ]
            }
        ]
    },
    stats: {
        warnings: false,
    },
};
