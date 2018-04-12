/* eslint-disable no-console */

module.exports = {
  error: function() {
    const args = Array.prototype.slice.call(arguments);
    args.unshift(new Date() + ' [ERROR]');
    console.log.apply(console, args);
  },

  info: function() {
    const args = Array.prototype.slice.call(arguments);
    args.unshift(new Date() + ' [INFO]');
    console.log.apply(console, args);
  },

  debug: function() {
    const args = Array.prototype.slice.call(arguments);
    args.unshift(new Date() + ' [DEBUG]');
    console.log.apply(console, args);
  },

  metric: (statistic, ...args) => {
    console.log(`${Date.now()} [METRIC] ${statistic}`, ...args);
  },
};
