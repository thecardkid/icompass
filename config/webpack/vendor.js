let path = require('path');
let webpack = require('webpack');

let PUBLIC = path.resolve(__dirname, '../../public/');

module.exports = {
    entry: {
        'vendor': [
            'react', 'react-dom', 'react-draggable',
            'react-redux', 'react-router', 'react-swipeable',
            'react-tappable', 'react-tooltip', 'redux', 'prop-types',
            'deep-equal', 'html2canvas', 'interactjs',
            'jquery', 'jspdf', 'underscore'
        ]
    },
    output: {
        path: PUBLIC,
        filename: 'vendor.dll.js',
        library: 'vendor_lib'
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, 'vendor-manifest.json'),
            name: 'vendor_lib',
            context: __dirname
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
        })
    ]
};