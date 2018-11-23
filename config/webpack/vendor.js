const path = require('path');
const webpack = require('webpack');

const { root } = require('./parts');

module.exports = {
  entry: {
    'vendor': [
      'attr-accept',
      'html2canvas',
      'interactjs',
      'jquery',
      'jspdf',
      'react',
      'react-dom',
      'react-draggable',
      'react-dropzone-s3-uploader',
      'react-redux',
      'react-router',
      'react-sortable',
      'react-swipeable',
      'react-tappable',
      'react-tooltip',
      'redux',
      'socket.io-client',
      'superagent',
      'underscore',
    ],
  },
  output: {
    path: path.resolve(root, 'public'),
    filename: 'vendor.dll.js',
    library: 'vendor_lib',
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, 'vendor-manifest.json'),
      name: 'vendor_lib',
      context: __dirname,
    }),
    // must use webpack's Uglify here because of some weird error
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      mangle: true,

      compress: {
        warnings: false,
        screw_ie8: true,
      },

      output: {
        comments: false,
        beautify: false,
      },

      exclude: [/\.min\.js$/gi] // skip pre-minified libs
    }),
  ],
};