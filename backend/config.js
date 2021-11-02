function mustGetEnvVar(n, acceptableValues = []) {
  const v = process.env[n];
  if (!v) {
    throw new Error(`expected env var ${n} to be set`);
  }
  if (acceptableValues.length === 0) {
    return v;
  }
  for (const x of acceptableValues) {
    if (v === x) {
      return v;
    }
  }
  throw new Error(`expected env var ${n} to be one of: ${acceptableValues}`);
}

function getEnvVar(n, defaultValue) {
  return process.env[n] || defaultValue;
}

const nodeEnv = mustGetEnvVar('NODE_ENV', ['development', 'production', 'test']);
const config = {
  appHost: getEnvVar('HOST', 'http://localhost:8080'),
  appPort: parseInt(getEnvVar('PORT', '8080')),
  s3Bucket: getEnvVar('S3_BUCKET', 'innovatorscompass'),

  serverEnv: {
    nodeEnv,
    isDev: nodeEnv === 'development',
    isProd: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
  },

  build: {
    // Set in .github/workflows/build-production-image.yml.
    id: getEnvVar('IC_BUILD_ID'),
    sha: getEnvVar('IC_BUILD_SHA'),
  },

  credentials: {
    emailPassword: getEnvVar('EMAIL_PASSWORD'),
    googleOAuthClientSecret: getEnvVar('GOOGLE_OAUTH_CLIENT_SECRET'),
  },
};

module.exports = config;
