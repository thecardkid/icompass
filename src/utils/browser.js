export function isBrowserTestRunning() {
  // Must match the one in cypress/config.js.
  return navigator.userAgent === 'cypress';
}
