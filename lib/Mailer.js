let email = require('emailjs');

let logger = require('./logger');

class Mailer {
  constructor() {
    this.server = email.server.connect({
      user: 'innovatorscompass@yahoo.com',
      password: 'Inn0v4t3!',
      host: 'smtp.mail.yahoo.com',
      tls: { ciphers: 'SSLv3' },
    });
  }

  sendMessage(text, toEmail, cb) {
    const message = {
      text: text,
      from: 'iCompass <innovatorscompass@yahoo.com>',
      to: `<${toEmail}>`,
      subject: 'Your iCompass workspace link',
    };

    this.server.send(message, function(err) {
      if (err) {
        logger.error('Could not send email to', toEmail, 'with content', text, err);
        return void cb(false);
      }

      logger.debug('Sent reminder email to', toEmail, 'with content', text);
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
