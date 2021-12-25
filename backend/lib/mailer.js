// Troubleshooting errors on EC2.
//
// SMTPError: authorization.failed seems to be caused by Google failing the new
// (suspicious) sign-in, likely because it is coming from a new IP. Log in to
// the account in a browser, mark the sign-in as not suspicious, and go to
// https://accounts.google.com/DisplayUnlockCaptcha.

const email = require('emailjs/email');
const config = require('../config');
const makeSingleton = require('./singletonFactory');
// Cannot import our logger, as it depends on the Mailer.


class Mailer {
  constructor() {
    if (!config.serverEnv.isProd) {
      // Mock out email to avoid Google thinking our gmail account
      // is being accessed from unsafe IP addresses (Travis' VMs).
      this.server = {
        send: function({ to, subject, text }, cb) {
          // eslint-disable-next-line no-console
          console.log(`In production, would've sent email:\n

To: ${to}
Subject: ${subject}
Message: ${text}
`);
          // Named so it's clear what is being passed to the callback.
          const err = null;
          cb(err);
        },
      };
    } else {
      this.server = email.server.connect({
        user: 'icompass.noreply@gmail.com',
        password: config.credentials.emailPassword,
        host: 'smtp.gmail.com',
        ssl: true,
      });
    }
  }

  sendMail({ text, recipientEmail, subject }) {
    return new Promise((resolve, reject) => {
      const message = {
        to: `<${recipientEmail}>`,
        from: 'iCompass <icompass.noreply@gmail.com>',
        subject,
        text,
      };
      this.server.send(message, function(err) {
        if (err) {
          // eslint-disable-next-line no-console
          console.error('Failed sending email: ', err);
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}

module.exports = makeSingleton(Mailer);
