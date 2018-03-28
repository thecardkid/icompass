import _ from 'underscore';

export default {
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

