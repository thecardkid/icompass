const CompressionPlugin = require('compression-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, '../../src/containers/App.jsx'),
  output: {
    path: path.join(__dirname, '../../public'),
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./vendor-manifest.json'),
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        ecma: 8,
        ie8: false,
        safari10: false,
        sourceMap: true,
        mangle: true,
        compress: {
          warnings: false,
        },
        output: {
          comments: false,
          beautify: false,
        },
        exclude: [/\.min\.js$/gi]
      },
    }),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0,
    })
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
    ],
  },
  stats: {
    warnings: false,
  },
};
