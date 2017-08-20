let path = require('path');
let webpack = require('webpack');

let HOME = path.resolve(__dirname, '../../');
let PUBLIC = path.resolve(HOME, 'public/');
let SRC = path.resolve(HOME, 'src/');

module.exports = {
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        })
    ],
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
};
