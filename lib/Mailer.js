let email = require('emailjs');

const logger = require('./logger');

class Mailer {
  constructor() {
    this.server = email.server.connect({
      user: 'innovatorscompass@yahoo.com',
      password: 'Inn0v4t3!',
      host: 'smtp.mail.yahoo.com',
      tls: { ciphers: 'SSLv3' },
    });
  }

  sendMessage(text, toEmail, subject, cb) {
    const message = {
      text: text,
      from: 'iCompass <innovatorscompass@yahoo.com>',
      to: `<${toEmail}>`,
      subject,
    };

    this.server.send(message, function(err) {
      if (err) {
        logger.error(err);
        return void cb(false);
      }

      cb(true);
    });
  }
}

module.exports = (() => {
  let instance = null;

  return {
    getInstance: () => {
      if (!instance) {
        instance = new Mailer();
        instance.constructor = null;
      }

      return instance;
    },
  };
})();
