const path = require('path');

module.exports = {
  devtool: 'eval',
  entry: path.join(__dirname, '../../src/containers/App.jsx'),
  output: {
    path: path.join(__dirname, '../../public'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        include: path.join(__dirname, '../../src'),
        loader: 'babel-loader',
        query: {
          presets: [
            'env',
            'react',
          ],
          plugins: [
            'transform-class-properties',
            'transform-object-rest-spread',
          ],
        },
      },
      {
        test: /\.less$/,
        include: path.join(__dirname, '../../src/css'),
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', options: { importLoaders: 1 } },
          { loader: 'less-loader' },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|mp4)$/,
        include: [path.join(__dirname, '../../public/static')],
        loader: 'file-loader',
      },
    ],
  },
};
