const email = require('emailjs/email');
const process = require('process');

function getEmailPassword() {
  const pw = process.env.EMAIL_PASSWORD;
  if (!pw) {
    throw new Error('EMAIL_PASSWORD environment variable not set');
  }
  return pw;
}

class Mailer {
  constructor() {
    if (process.env.NODE_ENV !== 'production') {
      // Mock out email to avoid Google thinking our gmail account
      // is being accessed from unsafe IP addresses (Travis' VMs)
      this.server = {
        send: function(message, cb) {
          // eslint-disable-next-line no-console
          console.log(`In production, would've sent email:\n${JSON.stringify(message)}`);
          const err = null;
          cb(err);
        },
      };
    } else {
      this.server = email.server.connect({
        user: 'icompass.noreply@gmail.com',
        password: getEmailPassword(),
        host: 'smtp.gmail.com',
        ssl: true,
      });
    }
  }

  sendMessage({ text, toEmail, subject, cb }) {
    const message = {
      to: `<${toEmail}>`,
      from: 'iCompass <icompass.noreply@gmail.com>',
      subject,
      text,
    };

    this.server.send(message, function(err) {
      if (err) {
        // eslint-disable-next-line no-console
        console.error('Failed sending email: ', err);
        cb(false);
        return;
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
