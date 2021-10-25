/* eslint-disable no-console */
const _ = require('underscore');

const mail = require('./mailer').getInstance();

class Logger {
  constructor(prefix) {
    this.prefix = prefix;
  }

  // Internal logging method. Returns array of arguments passed to
  // `console.log`.
  _log(log_type, original_args) {
    const args = Array.prototype.slice.call(original_args);
    if (this.prefix) {
      args.unshift(this.prefix);
    }
    args.unshift((new Date()).toISOString(), '[' + log_type + ']');
    console.log.apply(console, args);
    return args;
  }

  error() {
    const args = this._log('ERROR', arguments);
    mail.sendMessage({
      toEmail: 'hieumaster95@gmail.com',
      subject: 'iCompass server error',
      text: args,
      cb: _.noop,
    });
  }

  info() {
    this._log('INFO', arguments);
  }

  debug() {
    this._log('DEBUG', arguments);
  }
}

const DefaultLogger = new Logger();
module.exports = {
  DefaultLogger,
  Logger,
};
