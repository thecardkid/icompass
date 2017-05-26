'use strict';

import React, { Component } from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Storage from 'Utils/Storage.jsx';

export default class BookmarkList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bookmarks: Storage.getBookmarks()
        };
        Storage.lock();

        this.renderBookmark = this.renderBookmark.bind(this);
    }

    componentWillUnmount() {
        Storage.addAllBookmarks(this.state.bookmarks);
        Storage.unlock();
    }

    remove(center) {
        if (confirm('Remove this workspace?')) {
            let bookmarks = _.reject(this.state.bookmarks, e => e.center === center);
            this.setState({ bookmarks });
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
                    <h1>Your Workspaces</h1>
                    <div id="ic-bookmark-list">
                        {list}
                    </div>
                </div>
            </div>
        );
    }
}

