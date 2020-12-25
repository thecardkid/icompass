const path = require('path');
const webpack = require('webpack');

const { root, uglifyJsPlugin, websiteDist } = require('./parts');

module.exports = {
  mode: 'production',
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
    path: websiteDist,
    filename: 'vendor.dll.js',
    library: 'vendor_lib',
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, 'vendor-manifest.json'),
      name: 'vendor_lib',
      context: __dirname,
    }),
  ],
  optimization: {
    minimizer: [
      uglifyJsPlugin(),
    ],
  },
};