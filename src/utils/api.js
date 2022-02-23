import request from 'superagent';

class API {
  constructor(uiX) {
    this.uiX = uiX;
  }

  error(msg) {
    this.uiX.toastError(msg);
  }

  success(msg) {
    this.uiX.toastSuccess(msg);
  }

  hasErr(resp) {
    return resp.body && !!resp.body.error;
  }

  async sendReminderEmail({ topic, editCode, username, recipientEmail, isAutomatic }) {
    const resp = await request.post('/api/v1/workspace/send_reminder_email').send({
      topic,
      editCode,
      username,
      recipientEmail,
      isAutomatic,
    });
    if (this.hasErr(resp)) {
      if (isAutomatic) {
        this.uiX.toastAutomaticEmail(false, recipientEmail);
        return;
      }
      this.error('There was an error sending you an email with your workspace link.');
      return;
    }
    if (isAutomatic) {
      this.uiX.toastAutomaticEmail(true, recipientEmail);
      return;
    }
    this.success(`A link to this workspace has been sent to ${recipientEmail}`);
  }

  async sendBookmarksEmail({ bookmarks, recipientEmail }) {
    const resp = await request.post('/api/v1/workspace/send_bookmarks_email').send({
      bookmarks,
      recipientEmail,
    });
    if (this.hasErr(resp)) {
      this.error('There was an error sending your bookmarks. Please try again later.');
      return;
    }
    this.success('Your bookmarks have been emailed.');
  }

  async createWorkspace({ topic }) {
    const resp = await request.post('/api/v1/workspace/create').send({ topic });
    if (this.hasErr(resp)) {
      this.error('There was an error creating your workspace. Please try again later');
      return null;
    }
    return resp.body;
  }

  async createCopyOfWorkspace({ editCode, emailTo }) {
    const resp = await request.post('/api/v1/workspace/create_a_copy').send({
      editCode,
      emailTo,
    });
    if (this.hasErr(resp) || !resp.body.editCode) {
      this.error('There was a problem creating a copy of your workspace. Please try again later.');
      return null;
    }
    return { newWorkspaceCode: resp.body.editCode };
  }

  async submitFeedback({ submitterEmail, message }) {
    const resp = await request.post('/api/v1/workspace/submit_feedback').send({
      submitterEmail,
      message,
    });
    if (this.hasErr(resp)) {
      this.error('Failed to submit feedback, please try again later.');
      return false;
    }
    this.success('Your feedback has been submitted!');
    return true;
  }
}

let api;

export function initializeAPI(uiX) {
  api = new API(uiX);
}

export default function getAPIClient() {
  return api;
}
