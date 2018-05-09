const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: path.join(__dirname, '../../src/containers/App.jsx'),
  output: {
    path: path.join(__dirname, '../../public'),
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        HOST: JSON.stringify('http://localhost:8080'),
        S3_URL: JSON.stringify('https://s3.us-east-2.amazonaws.com/innovatorscompass'),
      }
    }),
  ],
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
