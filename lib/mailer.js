let email = require('emailjs');

let logger = require('./logger');

let server = email.server.connect({
  user: 'innovatorscompass@yahoo.com',
  password: 'Inn0v4t3!',
  host: 'smtp.mail.yahoo.com',
  tls: { ciphers: 'SSLv3' },
});

let Mailer = function() {
  this.server = email.server.connect({
    user: 'innovatorscompass@yahoo.com',
    password: 'Inn0v4t3!',
    host: 'smtp.mail.yahoo.com',
    tls: { ciphers: 'SSLv3' },
  });
};

Mailer.prototype.sendMessage = function(text, receiverEmail, cb) {
  const message = {
    text: text,
    from: 'iCompass <innovatorscompass@yahoo.com>',
    to: `<${receiverEmail}>`,
    subject: 'Your iCompass workspace link',
  };

  server.send(message, function(err) {
    if (err) {
      logger.error('Could not send email to', receiverEmail, 'with content', text, err);
      return void cb(false);
    }

    logger.debug('Sent reminder email to', receiverEmail, 'with content', text);
    cb(true);
  });
};

module.exports = Mailer;
