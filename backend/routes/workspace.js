require('babel-polyfill');
const express = require('express');
const config = require('../config');
const mailer = require('../lib/mailer').getInstance();
const compassSchema = require('../models/compass');


async function handleGetWorkspaceWithViewPermissions(req, res) {
  const compass = await compassSchema.findByViewCode(req.query.id);
  res.json({ compass });
}

// TODO rate-limit request? Let's see.
async function handleCreateWorkspace(req, res) {
  const { topic } = req.body;
  if (typeof topic !== 'string' || !topic) {
    res.json({'error': 'invalid topic'});
    return;
  }
  const compass = await compassSchema.makeCompass(topic);
  res.json({
    topic: topic,
    code: compass.editCode,
  });
}

async function handleCreateWorkspaceForDev(req, res) {
  const compass = await compassSchema.makeCompass('test-topic');
  res.json({
    code: compass.editCode,
  });
}

async function handleSendReminderEmail(req, res) {
  const {
    topic,
    editCode,
    username,
    recipientEmail,
    isAutomatic,
  } = req.body;
  let text = `Access your workspace via this link: ${config.appHost}/compass/edit/${editCode}/${username}`;
  if (isAutomatic) {
    text += `
\nYou received this email because you asked iCompass to automatically send you the link to a workspace
whenever you create one. To stop receiving these automatic emails, please go to this link:
${config.appHost}/disable-auto-email.`
  }
  mailer.sendMail({
    recipientEmail,
    subject: `Your iCompass workspace "${topic}"`,
    text,
  }, function(ok) {
    if (!ok) {
      throw new Error('failed to send reminder email');
    }
    res.send('ok');
  });
}

async function handleEmailBookmarks(req, res) {
  const { bookmarks, recipientEmail } = req.body;
  const lines = ['Below are your iCompass bookmarks:', '', ''];
  for (let i = 0; i < bookmarks.length; i++) {
    const { center, href } = bookmarks[i];
    if (!center || !href) {
      res.json({'error': `bookmark at index ${i} is invalid`});
      return;
    }
    lines.push(`${center}: ${config.appHost}${href}`);
  }
  mailer.sendMail({
    subject: 'Your iCompass bookmarks',
    text: lines.join('\n'),
    toEmail: recipientEmail,
  }, function(ok) {
    if (!ok) {
      throw new Error('failed to send bookmarks email');
    }
    res.send('ok');
  });
}

function tryCatch(fn) {
  return function(req, res, next) {
    try {
      fn(req, res, next);
    } catch (ex) {
      this.logger.error(`Error handling ${req.path} for request body ${req.body}:\n${ex.message}`);
      res.json({'error': 'server error'});
    }
  }
}


module.exports = (function() {
  const router = express.Router();
  router.get('/view', tryCatch(handleGetWorkspaceWithViewPermissions));
  router.post('/create', tryCatch(handleCreateWorkspace));
  router.post('/send_reminder_email', tryCatch(handleSendReminderEmail));
  router.post('/send_bookmarks_email', tryCatch(handleEmailBookmarks));
  if (config.serverEnv.isDev) {
    router.post('/create_dev', tryCatch(handleCreateWorkspaceForDev));
  }
  return router;
})();
