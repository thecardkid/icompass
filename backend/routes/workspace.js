require('babel-polyfill');
const express = require('express');
const config = require('../config');
const mailer = require('../lib/mailer').getInstance();
const CompassModel = require('../models/compass');

const error = (msg) => ({ error: msg });

function onErr(res) {
  return function(err) {
    res.json(error('server error'));
    // Throw for uncaughtException handler.
    throw err;
  }
}

function handleGetWorkspaceWithViewPermissions(req, res) {
  if (!req.query.id) {
    res.status(400);
    return;
  }
  CompassModel.findByViewCode(req.query.id).then(compass => {
    res.json({ compass });
  }).catch(onErr(res));
}

function handleGetWorkspaceWithEditPermissions(req, res) {
  if (!req.query.code) {
    res.status(400);
    return;
  }
  CompassModel.findByEditCode(req.query.code).then(compass => {
    res.json({ compass });
  }).catch(onErr(res));
}

// TODO rate-limit request? Let's see.
function handleCreateWorkspace(req, res) {
  const { topic } = req.body;
  if (typeof topic !== 'string' || !topic) {
    res.status(400);
    return;
  }
  CompassModel.makeCompass(topic).then(compass => {
    res.json({
      topic: topic,
      code: compass.editCode,
    });
  }).catch(onErr(res));
}

function handleCreateWorkspaceForDev(req, res) {
  CompassModel.makeCompass('test-topic').then(compass => {
    res.json({ code: compass.editCode });
  });
}

function handleSendReminderEmail(req, res) {
  const {
    topic,
    editCode,
    recipientEmail,
    isAutomatic,
  } = req.body;
  let text = `Access your workspace via this link: ${config.appHost}/compass/edit/${editCode}`;
  if (isAutomatic) {
    text += `
\nYou received this email because you asked iCompass to automatically send you the link to a workspace
whenever you create one. To stop receiving these automatic emails, please go to this link:
${config.appHost}/disable-auto-email.`
  }
  mailer.sendEmailSES({
    recipientEmail,
    subject: `Your iCompass workspace "${topic}"`,
    text,
  }).then(() => res.send('ok')).catch(onErr(res));
}

function handleEmailBookmarks(req, res) {
  const { bookmarks, recipientEmail } = req.body;
  const lines = ['Below are your iCompass bookmarks:', '', ''];
  for (let i = 0; i < bookmarks.length; i++) {
    const { center, href } = bookmarks[i];
    if (!center || !href) {
      res.json(error(`bookmark at index ${i} is invalid`));
      return;
    }
    lines.push(`${center}: ${config.appHost}${href}`);
  }
  mailer.sendEmailSES({
    subject: 'Your iCompass bookmarks',
    text: lines.join('\n'),
    recipientEmail,
  }).then(() => res.send('ok')).catch(onErr(res));
}

function handleSubmitFeedback(req, res) {
  const { submitterEmail, message } = req.body;
  mailer.sendEmailSES({
    subject: 'iCompass Feedback',
    recipientEmail: 'hieumaster95@gmail.com',
    text: message + `\n\nFrom: ${submitterEmail || 'No email specified'}`,
  }).then(() => res.send('ok')).catch(onErr(res));
}

function handleCreateCopyOfWorkspace(req, res) {
  const { editCode } = req.body;
  CompassModel.findByEditCode(editCode).then(compass => {
    if (!compass) {
      res.json({ 'error': `no workspace with code ${editCode}` })
      return;
    }
    CompassModel.makeCompassCopy(compass).then(copy => {
      res.json({ editCode: copy.editCode });
    }).catch(onErr(res));
  }).catch(onErr(res));
}

module.exports = (function() {
  const router = express.Router();
  router.get('/view', handleGetWorkspaceWithViewPermissions);
  router.get('/edit', handleGetWorkspaceWithEditPermissions);
  router.post('/create', handleCreateWorkspace);
  router.post('/create_a_copy', handleCreateCopyOfWorkspace);
  router.post('/send_reminder_email', handleSendReminderEmail);
  router.post('/send_bookmarks_email', handleEmailBookmarks);
  router.post('/submit_feedback', handleSubmitFeedback);
  if (config.serverEnv.isDev) {
    router.post('/create_dev', handleCreateWorkspaceForDev);
  }
  return router;
})();
