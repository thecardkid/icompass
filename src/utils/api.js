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

  async sendReminderEmail({ topic, editCode, username, recipientEmail, isAutomatic }) {
    const resp = await request.post('/api/v1/workspace/send_reminder_email').send({
      topic,
      editCode,
      username,
      recipientEmail,
      isAutomatic,
    });
    if (resp.body && resp.body.error) {
      this.error('There was an issue sending you the email. Please note down your codes manually somewhere.');
      return;
    }
    if (isAutomatic) {
      this.success('A link to this workspace has been automatically sent to you.');
      return;
    }
    this.success('A link to this workspace has been sent to you');
  }

  async sendBookmarksEmail({ bookmarks, recipientEmail }) {
    const resp = await request.post('/api/v1/workspace/send_bookmarks_email').send({
      bookmarks,
      recipientEmail,
    });
    if (resp.body && resp.body.error) {
      this.error('There was an issue sending your bookmarks. Please try again later.');
      return;
    }
    this.success('Your bookmarks have been emailed.');
  }

  async createWorkspace({ topic }) {
    const resp = await request.post('/api/v1/workspace/create').send({ topic });
    const data = resp.body;
    if (data.error) {
      this.error('Error creating workspace. Please try again later');
      throw new Error(data.error);
    }
    return resp.body;
  }

  async createCopyOfWorkspace({ editCode }) {
    const resp = await request.post('/api/v1/workspace/create_a_copy').send({
      editCode,
    });
    if (resp.body && (resp.body.error || !resp.body.editCode)) {
      this.error('There was a problem creating a copy of your workspace. Please try again later.');
      return null;
    }
    return { newWorkspaceCode: resp.body.editCode };
  }

  async submitFeedback({ submitterEmail, message }) {
    await request.post('/api/v1/workspace/submit_feedback').send({
      submitterEmail,
      message,
    });
    // Don't notify if failed.
    this.success('Your feedback has been submitted!');
  }
}

let api;

export function initializeAPI(uiX) {
  api = new API(uiX);
}

export default function getAPIClient() {
  return api;
}
