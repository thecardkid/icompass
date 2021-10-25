module.exports = {
  appHost: process.env.HOST,
  appPort: process.env.PORT || 8080,
  s3Bucket: process.env.S3_BUCKET || 'innovatorscompass',

  googleOAuthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
};
