import _ from 'underscore';

export default {
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
      return;
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

    if (ws.drafts.length <= idx) {
      return;
    }

    ws.drafts.splice(idx, 1);
    this.setWorkspace(editCode, ws);
    return ws.drafts;
  },

  getDrafts(editCode) {
    const ws = this.getWorkspace(editCode);
    return ws.drafts || [];
  },

  getBookmarks() {
    return JSON.parse(localStorage.getItem('bookmarks')) || [];
  },

  setBookmarks(b) {
    localStorage.setItem('bookmarks', JSON.stringify(b));
  },

  addAllBookmarks(newBookmarks) {
    let bookmarks = (this.getBookmarks()).concat(newBookmarks);
    this.setBookmarks(bookmarks);
  },

  addBookmark(center, code, name) {
    let href = `/compass/edit/${code}/${name}`;
    this.addAllBookmarks([
      { center, href, name },
    ]);
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

  updateName(idx, name) {
    let b = this.getBookmarks();
    b[idx].center = name;
    this.setBookmarks(b);
    return b;
  },
};

