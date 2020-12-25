const path = require('path');

const { root, jsxLoader, lessLoader, fileLoader, websiteDist } = require('./parts');

module.exports = () => ({
  entry: path.resolve(root, 'src/containers/App.jsx'),
  output: {
    path: websiteDist,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      jsxLoader(),
      lessLoader(),
      fileLoader(),
    ],
  },
});
