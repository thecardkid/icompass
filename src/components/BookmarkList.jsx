'use strict';

import React, { Component } from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Storage from 'Utils/Storage.jsx';

import { PROMPTS } from 'Lib/constants';

export default class BookmarkList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bookmarks: Storage.getBookmarks()
        };

        this.renderBookmark = this.renderBookmark.bind(this);
    }

    remove(center) {
        if (confirm(PROMPTS.CONFIRM_DELETE_BOOKMARK)) {
            Storage.removeBookmark(center);
            this.setState({ bookmarks: Storage.getBookmarks() });
        }
    }

    renderBookmark(w, idx) {
        return (
            <div className="ic-saved" key={'saved'+idx}>
                <Link to={w.href}>{w.center}</Link> as {w.name}
                <button onClick={() => this.remove(w.center)}>X</button>
            </div>
        );
    }

    render() {
        let list = _.map(this.state.bookmarks, this.renderBookmark);

        return (
            <div id="ic-bookmarks">
                <div id="contents">
                    <h1>Saved Workspaces</h1>
                    <div id="ic-bookmark-list">
                        {list}
                    </div>
                </div>
            </div>
        );
    }
}

