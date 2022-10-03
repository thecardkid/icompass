// Troubleshooting errors on EC2.
//
// SMTPError: authorization.failed seems to be caused by Google failing the new
// (suspicious) sign-in, likely because it is coming from a new IP. Log in to
// the account in a browser, mark the sign-in as not suspicious, and go to
// https://accounts.google.com/DisplayUnlockCaptcha.

const config = require('../config');
const makeSingleton = require('./singletonFactory');
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
// Cannot import our logger, as it depends on the Mailer.

const sendEmailInDev = false;

class Mailer {
  constructor() {
    this.sesClient = new AWS.SES({ apiVersion: '2010-12-01' });
  }

  sendEmailSES({ text, recipientEmail, subject }) {
    if (config.serverEnv.isTest || (config.serverEnv.isDev && !sendEmailInDev)) {
      // eslint-disable-next-line no-console
      console.log(`In production, would've sent email:\n

To: ${recipientEmail}
Subject: ${subject}
Message: ${text}
`);
      return new Promise(resolve => resolve());
    }

    const params = {
      Source: 'iCompass <noreply@icompass.me>',
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: text,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        }
      },
    };
    return this.sesClient.sendEmail(params).promise();
  }
}

module.exports = makeSingleton(Mailer);
