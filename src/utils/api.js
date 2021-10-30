import request from 'superagent';

import Toast from './Toast';

const toast = Toast.getInstance();

export async function sendReminderEmail({ topic, editCode, username, recipientEmail, isAutomatic }) {
  const resp = await request.post('/api/v1/workspace/send_reminder_email').send({
    topic,
    editCode,
    username,
    recipientEmail,
    isAutomatic,
  });
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
  if (resp.body && resp.body.error) {
    toast.error('There was an issue sending your bookmarks. Please try again later.');
    return;
  }
  toast.success('Your bookmarks have been emailed.');
}

export async function submitFeedback({ submitterEmail, message }) {
  await request.post('/api/v1/workspace/submit_feedback').send({
    submitterEmail,
    message,
  });
  // Don't notify if failed.
  toast.success('Your feedback has been submitted!');
}

export async function createCopyOfWorkspace({ editCode }) {
  const resp = await request.post('/api/v1/workspace/create_a_copy').send({
    editCode,
  });
  if (resp.body && (resp.body.error || !resp.body.editCode)) {
    toast.error('There was a problem creating a copy of your workspace. Please try again later.');
    return null;
  }
  return { newWorkspaceCode: resp.body.editCode };
}
