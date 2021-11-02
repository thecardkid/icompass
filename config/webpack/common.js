const path = require('path');

const { root, jsxLoader, lessLoader, fileLoader, websiteDist } = require('./parts');

module.exports = () => ({
  entry: {
    bundle: path.resolve(root, 'src/containers/App.jsx'),
    admin: path.resolve(root, 'src/containers/AdminApp.jsx'),
  },
  output: {
    path: websiteDist,
    filename: '[name].js',
  },
  resolve: {
    alias: {
      '@actions': path.resolve(root, 'src/actions'),
      '@components': path.resolve(root, 'src/components'),
      '@utils': path.resolve(root, 'src/utils'),
      '@socket_events': path.resolve(root, 'backend/lib/socket_events.js'),
    },
  },
  module: {
    rules: [
      jsxLoader(),
      lessLoader(),
      fileLoader(),
    ],
  },
});
