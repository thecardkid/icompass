const logger = require('./logger');

class MetricsSocket {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;

    this.listen('landing page time', this.landingPageTime);
    this.listen('direct url access', this.directUrlAccess);
  }

  listen(event, handler) {
    this.socket.on(`metric ${event}`, handler.bind(this));
  }

  landingPageTime(start, end, action) {
    logger.metric(`Time spent on landing page to ${action}: ${end - start} ms`);
  }

  directUrlAccess(url) {
    logger.metric(`Direct URL access at ${url}`);
  }
}

const bindMetricsEvent = (io, socket) => {
  return new MetricsSocket(io, socket);
};

module.exports = bindMetricsEvent;
