'use strict';

import _ from 'underscore';

export default {
    getBookmarks() {
        return JSON.parse(localStorage.getItem('bookmarks')) || [];
    },

    setBookmarks(b) {
        localStorage.setItem('bookmarks', JSON.stringify(b));
    },

    addAllBookmarks(bookmarks) {
        let withDups = (this.getBookmarks()).concat(bookmarks);
        let unique = _.uniq(withDups, (item) => item.center);
        this.setBookmarks(unique);
        return true;
    },

    addBookmark(center, code, name) {
        let href = '/compass/edit/'+code+'/'+name;
        return this.addAllBookmarks([
            { center, href, name }
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
    }
};

