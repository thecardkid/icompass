'use strict';

import React, { Component } from 'react';
import { Link } from 'react-router';
import _ from 'underscore';

import Modal from '../utils/Modal';
import Storage from '../utils/Storage';

import { MODALS } from '../../lib/constants';

export default class BookmarkList extends Component {
    constructor(props) {
        super(props);
        this.modal = new Modal();

        let b = Storage.getBookmarks();
        this.state = {
            bookmarks: b,
            show: new Array(b.length).fill(false)
        };

        this.renderBookmark = this.renderBookmark.bind(this);
        this.edit = this.edit.bind(this);
        this.remove = this.remove.bind(this);
        this.expand = this.expand.bind(this);
    }

    edit(e, idx) {
        e.stopPropagation();
        this.modal.prompt(MODALS.EDIT_BOOKMARK, (updated, newName) => {
            if (updated && newName) {
                let bookmarks = Storage.updateName(idx, newName);
                this.setState({bookmarks});
            }
        });
    }

    remove(e, idx) {
        e.stopPropagation();
        this.modal.confirm(MODALS.DELETE_BOOKMARK, (deleteBookmark) => {
            if (deleteBookmark) {
                let bookmarks = Storage.removeBookmark(idx);
                let show = this.state.show;
                show.splice(idx, 1);
                this.setState({bookmarks, show});
            }
        });
    }

    expand(idx) {
        let show = this.state.show;
        show[idx] = !show[idx];
        this.setState({ show });
    }

    renderBookmark(w, idx) {
        let style = {
            height: this.state.show[idx] ? '20px' : '0px',
            marginTop: this.state.show[idx] ? '15px' : '0px'
        };
        let info = (
            <div className="ic-saved-info" style={style}>
                <p>as &quot;{w.name}&quot;</p>
                <button className="remove" onClick={(e) => this.remove(e, idx)}>remove</button>
                <button className="edit" onClick={(e) => this.edit(e, idx)}>edit</button>
            </div>
        );

        let arrow = this.state.show[idx] ?
            <span id="arrow">&#9664;</span> :
            <span id="arrow">&#9660;</span>;

        return (
            <div className="ic-saved" key={'saved'+idx} onClick={() => this.expand(idx)}>
                <Link to={w.href}>{w.center}</Link>
                {arrow}
                {info}
            </div>
        );
    }

    render() {
        let list = _.map(this.state.bookmarks, this.renderBookmark);

        return (
            <div id="ic-bookmarks">
                <div id="contents">
                    <h1>
                        <i className="material-icons">star</i>
                         Bookmarks
                    </h1>
                    <div id="ic-bookmark-list">
                        {list}
                    </div>
                </div>
            </div>
        );
    }
}

