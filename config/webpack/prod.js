const webpack = require('webpack');
const merge = require('webpack-merge');

const commonConfig = require('./common');
const { compressionPlugin, uglifyJsPlugin } = require('./parts');

function getGoogleAnalyticsTrackingID() {
  if (!process.env.GA_TRACKING_ID) {
    throw new Error('Missing env var GA_TRACKING_ID');
  }
  return process.env.GA_TRACKING_ID;
}

const prodConfig = () => merge(
  commonConfig(),
  {
    mode: 'production',
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: false,
        GA_TRACKING_ID: JSON.stringify(getGoogleAnalyticsTrackingID()),
        'icompass.config': {
          APP_ENV: JSON.stringify('production'),
          APP_HOST: JSON.stringify('https://icompass.me'),
          S3_URL: JSON.stringify('https://s3.us-east-2.amazonaws.com/innovatorscompassprod'),
        },
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.DllReferencePlugin({
        context: __dirname,
        manifest: require('./vendor-manifest.json'),
      }),
    ],
    optimization: {
      minimizer: [
        uglifyJsPlugin(),
        compressionPlugin(),
      ],
    },
    stats: {
      warnings: false,
    },
  },
);

module.exports = prodConfig;
