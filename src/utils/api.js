import request from 'superagent';

import Toast from './Toast';

export async function sendReminderEmail({ topic, editCode, username, recipientEmail, isAutomatic }) {
  const resp = await request.post('/api/v1/workspace/send_reminder_email').send({
    topic,
    editCode,
    username,
    recipientEmail,
    isAutomatic,
  });
  const toast = Toast.getInstance();
  if (resp.body && resp.body.error) {
    toast.error('There was an issue sending you the email. Please note down your codes manually somewhere.');
    return;
  }
  if (isAutomatic) {
    toast.success('A link to this workspace has been automatically sent to you.');
    return;
  }
  toast.success('A link to this workspace has been sent to you');
}

export async function sendBookmarksEmail({ bookmarks, recipientEmail }) {
  const resp = await request.post('/api/v1/workspace/send_bookmarks_email').send({
    bookmarks,
    recipientEmail,
  });
  const toast = Toast.getInstance();
  if (resp.body && resp.body.error) {
    toast.error('There was an issue sending your bookmarks. Please try again later.');
    return;
  }
  toast.success('Your bookmarks have been emailed.');
}
