const email = require('emailjs/email');

function getEmailPassword() {
  const pw = process.env.EMAIL_PASSWORD;
  if (!pw) {
    throw new Error('EMAIL_PASSWORD environment variable not set');
  }
  return pw;
}

class Mailer {
  constructor() {
    // this.server = email.server.connect({
    //   user: 'icompass.noreply@gmail.com',
    //   password: getEmailPassword(),
    //   host: 'smtp.gmail.com',
    //   ssl: true,
    // });
  }

  sendMessage({ text, toEmail, subject, cb }) {
    cb(false);
  //
  //   const message = {
  //     to: `<${toEmail}>`,
  //     from: 'iCompass <innovatorscompass@yahoo.com>',
  //     subject,
  //     text,
  //   };
  //
  //   this.server.send(message, function(err) {
  //     if (err) {
  //       // eslint-disable-next-line no-console
  //       console.error('Failed sending email: ', err);
  //       cb(false);
  //       return;
  //     }
  //
  //     cb(true);
  //     return;
  //   });
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
