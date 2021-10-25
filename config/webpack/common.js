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
  module: {
    rules: [
      jsxLoader(),
      lessLoader(),
      fileLoader(),
    ],
  },
});
