const logger = require('./logger');

class MetricsSocket {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;

    this.listen('landing page time', this.landingPageTime);
  }

  listen(event, handler) {
    this.socket.on(`metric ${event}`, handler.bind(this));
  }

  landingPageTime(start, end, action) {
    logger.metric(`Time spent on landing page to ${action}: ${end - start} ms`);
  }
}

const bindMetricsEvent = (io, socket) => {
  return new MetricsSocket(io, socket);
};

module.exports = bindMetricsEvent;
