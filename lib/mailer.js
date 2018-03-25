'use strict';

var email = require('emailjs');
var logger = require('./logger');

var server = email.server.connect({
  user: 'innovatorscompass@yahoo.com',
  password: 'Inn0v4t3!',
  host: 'smtp.mail.yahoo.com',
  tls: { ciphers: 'SSLv3' },
});

var Mailer = function() {
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
    to: '<' + receiverEmail + '>',
    subject: 'Your iCompass workspace link',
  };

  server.send(message, function(err) {
    if (err) {
      logger.error('Could not send email to', receiverEmail, 'with content', text, err);
      cb(false);
      return;
    }

    logger.debug('Sent reminder email to', receiverEmail, 'with content', text);
    cb(true);
  });
};

module.exports = Mailer;
