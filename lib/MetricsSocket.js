const _ = require('underscore');

const logger = require('./logger');

const simpleLogEvents = [
  'double click note',
  'double click image',
  'double click doodle',
  'note create',
  'note edit',
  'note doodle',
  'note image',
  'note image edit',
];

class MetricsSocket {
  constructor(session) {
    this.socket = session.getSocket();
    this.session = session;

    _.each(simpleLogEvents, (ev) => {
      const stmt = ev[0].toUpperCase() + ev.slice(1);
      this.listen(ev, this.simpleLog(stmt));
    });
  }

  listen(event, handler) {
    this.socket.on(`metric ${event}`, handler);
  }

  simpleLog(stmt) {
    return (...args) => {
      const sessionId = this.session.getSessionId() || 'unknown';
      logger.metric(`Session ${sessionId} - ${stmt} ${args}`);
    };
  }
}

const bindMetricsEvent = (io, socket) => {
  return new MetricsSocket(io, socket);
};

module.exports = bindMetricsEvent;
