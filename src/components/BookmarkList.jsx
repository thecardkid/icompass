'use strict';

import React, { Component } from 'react';
import { Link } from 'react-router';
import _ from 'underscore';

import Storage from 'Utils/Storage.jsx';

import { PROMPTS } from 'Lib/constants';

export default class BookmarkList extends Component {
    constructor(props) {
        super(props);

        let b = Storage.getBookmarks();
        this.state = {
            bookmarks: b,
            show: Array(b.length).fill(false)
        };

        this.renderBookmark = this.renderBookmark.bind(this);
        this.remove = this.remove.bind(this);
        this.expand = this.expand.bind(this);
    }

    remove(e, idx) {
        e.stopPropagation();
        if (confirm(PROMPTS.CONFIRM_DELETE_BOOKMARK)) {
            let bookmarks = Storage.removeBookmark(idx);
            let show = this.state.show.splice(idx, 1);
            this.setState({ bookmarks, show });
        }
    }

    expand(idx) {
        let show = this.state.show;
        show[idx] = !show[idx];
        this.setState({ show });
    }

    renderBookmark(w, idx) {
        let style = {height: this.state.show[idx] ? '20px' : '0px'};
        let info = (
            <div className="ic-saved-info" style={style}>
                <p>as &quot;{w.name}&quot;</p>
                <button className="remove" onClick={(e) => this.remove(e, idx)}>remove</button>
            </div>
        );

        return (
            <div className="ic-saved" key={'saved'+idx} onClick={() => this.expand(idx)}>
                <Link to={w.href}>{w.center}</Link>
                {info}
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

