const webpack = require('webpack');
const merge = require('webpack-merge');

const commonConfig = require('./common');
const { compressionPlugin, uglifyJsPlugin } = require('./parts');

const prodConfig = () => merge(
  commonConfig(),
  {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          HOST: JSON.stringify(process.env.HOST || 'https://icompass.me'),
          S3_URL: JSON.stringify(`https://s3.us-east-2.amazonaws.com/${process.env.S3_BUCKET || 'innovatorscompass'}`),
        }
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.DllReferencePlugin({
        context: __dirname,
        manifest: require('./vendor-manifest.json'),
      }),
      uglifyJsPlugin(),
      compressionPlugin(),
    ],
    stats: {
      warnings: false,
    },
  },
);

module.exports = prodConfig;
