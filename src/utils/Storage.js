import _ from 'underscore';
import { isEmail } from './regex';

// TODO provide better structure to the prefs object
export default {
  getUserPrefs() {
    return JSON.parse(localStorage.getItem('prefs')) || {};
  },

  setUserPrefs(prefs) {
    localStorage.setItem('prefs', JSON.stringify(prefs));
  },

  getNoteProgress(key) {
    const x = JSON.parse(localStorage.getItem('notesProgress')) || {};
    return x[key] || null;
  },

  saveNoteProgress(key, value) {
    const x = JSON.parse(localStorage.getItem('notesProgress')) || {};
    x[key] = value;
    localStorage.setItem('notesProgress', JSON.stringify(x));
  },

  isEmailReminderEnabled() {
    return localStorage.getItem('disableEmailReminder') !== 'yes';
  },

  disableEmailReminder() {
    localStorage.setItem('disableEmailReminder', 'yes');
  },

  isBookmarkDeprecationReminderEnabled() {
    return localStorage.getItem('disableBookmarkReminder') !== 'yes';
  },

  disableBookmarkDeprecationReminder() {
    localStorage.setItem('disableBookmarkReminder', 'yes');
  },

  setDarkTheme(value) {
    const prefs = this.getUserPrefs();
    prefs.darkTheme = value;
    this.setUserPrefs(prefs);
    return value;
  },

  isDarkTheme() {
    const prefs = this.getUserPrefs();
    return prefs.darkTheme || false;
  },

  parseWorkspaceCodeFromURL() {
    const pattern = /\/compass\/edit\/(.*)\/.*/;
    const found = location.pathname.match(pattern);
    if (!found || found.length !== 2) {
      return '_notfound';
    }
    return found[1];
  },

  getStickyNoteColor() {
    const prefs = this.getUserPrefs();
    const x = prefs.stickyNoteColors || {};
    return x[this.parseWorkspaceCodeFromURL()] || '#CCFFFF';
  },

  setStickyNoteColor(c) {
    const workspaceCode = this.parseWorkspaceCodeFromURL();
    const prefs = this.getUserPrefs();
    const x = prefs.stickyNoteColors || {};
    x[workspaceCode] = c;
    prefs.stickyNoteColors = x;
    this.setUserPrefs(prefs);
    // eslint-disable-next-line no-console
    console.log(`Set note color for workspace ${workspaceCode} to ${c}`);
    return c;
  },

  getTooltipTypeBasedOnDarkTheme() {
    if (this.isDarkTheme()) {
      return 'light';
    }
    return 'dark';
  },

  setAlwaysSendEmail(enabled, email=null) {
    const prefs = this.getUserPrefs();
    prefs.alwaysSendEmail = { enabled, email };
    this.setUserPrefs(prefs);
  },

  getAlwaysSendEmail() {
    const prefs = this.getUserPrefs();
    if (prefs.hasOwnProperty('alwaysSendEmail') &&
        prefs.alwaysSendEmail.enabled &&
        isEmail(prefs.alwaysSendEmail.email)) {
      return prefs.alwaysSendEmail;
    }
    return { enabled: false };
  },

  getWorkspace(editCode) {
    const all = JSON.parse(localStorage.getItem('workspaces')) || {};
    return all[editCode] || {};
  },

  setWorkspace(editCode, ws) {
    const all = JSON.parse(localStorage.getItem('workspaces')) || {};
    all[editCode] = ws;
    localStorage.setItem('workspaces', JSON.stringify(all));
  },

  addDraft(editCode, draft) {
    const ws = this.getWorkspace(editCode);
    if (!_.has(ws, 'drafts')) {
      ws.drafts = [];
    }
    ws.drafts.push(draft);
    this.setWorkspace(editCode, ws);
    return ws.drafts;
  },

  setDraft(editCode, idx, draft) {
    const ws = this.getWorkspace(editCode);
    if (!_.has(ws, 'drafts')) {
      return;
    }

    if (idx >= ws.drafts.length) {
      return ws.drafts;
    }

    ws.drafts[idx] = draft;
    this.setWorkspace(editCode, ws);
    return ws.drafts;
  },

  removeDraft(editCode, idx) {
    const ws = this.getWorkspace(editCode);
    if (!_.has(ws, 'drafts')) {
      return;
    }

    if (ws.drafts.length === 0 || ws.drafts.length <= idx) {
      return ws.drafts;
    }

    ws.drafts.splice(idx, 1);
    this.setWorkspace(editCode, ws);
    return ws.drafts;
  },

  getDrafts(editCode) {
    const ws = this.getWorkspace(editCode);
    return ws.drafts || [];
  },

  setShowBookmarks(value) {
    const prefs = this.getUserPrefs();
    prefs.showBookmarks = value;
    this.setUserPrefs(prefs);
  },

  getShowBookmarks() {
    const prefs = this.getUserPrefs();
    return prefs.showBookmarks || false;
  },

  getBookmarks() {
    return JSON.parse(localStorage.getItem('bookmarks')) || [];
  },

  setBookmarks(b) {
    localStorage.setItem('bookmarks', JSON.stringify(b));
  },

  removeBookmark(idx) {
    let b = this.getBookmarks();
    b.splice(idx, 1);
    this.setBookmarks(b);
    return b;
  },

  removeBookmarkByCenter(center) {
    let b = this.getBookmarks();
    b = _.reject(b, e => e.center === center);
    this.setBookmarks(b);
    return b;
  },

  getRecentWorkspaces() {
    return JSON.parse(localStorage.getItem('recent-workspaces')) || {};
  },

  setRecentWorkspaces(b) {
    localStorage.setItem('recent-workspaces', JSON.stringify(b));
  },

  markVisitedWorkspace(url, username, topic) {
    if (typeof url !== 'string') {
      return;
    }
    let now = new Date().getTime();
    const parts = url.split('/').slice(0, 4);
    // Skip parts[0], which is an empty string.
    if (parts[1] !== 'compass') {
      return;
    }
    let isViewOnly = false;
    if (parts[2] !== 'edit') {
      if (parts[2] === 'view') {
        isViewOnly = true;
      } else {
        return;
      }
    }
    if (parts[3].length !== 8) {
      return;
    }
    if (!isViewOnly) {
      parts.push(username);
    }

    const data = this.getRecentWorkspaces();
    data[parts[3]] = {
      url: parts.join('/'),
      visitedAt: now,
      isViewOnly,
      topic,
    };
    this.setRecentWorkspaces(data);
  },

  updateRecentWorkspaceTopic(code, topic) {
    const data = this.getRecentWorkspaces();
    if (data.hasOwnProperty(code)) {
      data[code].topic = topic;
    }
    this.setRecentWorkspaces(data);
  },
};

