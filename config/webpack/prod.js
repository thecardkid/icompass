const webpack = require('webpack');
const merge = require('webpack-merge');

const commonConfig = require('./common');
const { compressionPlugin, uglifyJsPlugin } = require('./parts');

function getHost() {
  return process.env.HOST || 'https://icompass.me';
}

function getS3BucketName() {
  return process.env.S3_BUCKET || 'innovatorscompass';
}

function getNodeEnv() {
  return process.env.NODE_ENV || 'production';
}

function getGATrackingID() {
  if (getNodeEnv() === 'production') {
    return process.env.GA_TRACKING_ID;
  }
  return '';
}

const prodConfig = () => merge(
  commonConfig(),
  {
    mode: 'production',
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: false,
        GA_TRACKING_ID: JSON.stringify(getGATrackingID()),
        'process.env': {
          HOST: JSON.stringify(getHost()),
          S3_URL: JSON.stringify(`https://s3.us-east-2.amazonaws.com/${getS3BucketName()}`),
          NODE_ENV: JSON.stringify(getNodeEnv()),
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
