import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import _ from 'underscore';

import Modal from '../utils/Modal';
import Storage from '../utils/Storage';

import { MODALS } from '../../lib/constants';
import Socket from '../utils/Socket';

export default class BookmarkList extends Component {
  constructor(props) {
    super(props);
    this.modal = Modal.getInstance();
    this.socket = Socket.getInstance();

    let b = Storage.getBookmarks();
    this.state = {
      bookmarks: b,
      show: new Array(b.length).fill(false),
      showBookmarks: Storage.getShowBookmarks(),
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
        this.setState({ bookmarks });
      }
    }, this.state.bookmarks[idx].center);
  }

  remove(e, idx) {
    e.stopPropagation();
    this.modal.confirm(MODALS.DELETE_BOOKMARK, (deleteBookmark) => {
      if (deleteBookmark) {
        let bookmarks = Storage.removeBookmark(idx);
        let show = this.state.show;
        show.splice(idx, 1);
        this.setState({ bookmarks, show });
      }
    });
  }

  expand(idx) {
    let show = this.state.show;
    show[idx] = !show[idx];
    this.setState({ show });
  }

  navigateTo = (href) => () => {
    this.socket.emitMetricLandingPage(this.props.start, Date.now(), 'navigate with bookmark');
    browserHistory.push(href);
  };

  renderBookmark(w, idx) {
    let style = {
      height: this.state.show[idx] ? '20px' : '0px',
      marginTop: this.state.show[idx] ? '15px' : '0px',
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
      <div className="ic-saved" key={`saved${idx}`} onClick={() => this.expand(idx)}>
        <a onClick={this.navigateTo(w.href)}>{w.center}</a>
        {arrow}
        {info}
      </div>
    );
  }

  toggleBookmarks = () => {
    const showBookmarks = Storage.setShowBookmarks(!this.state.showBookmarks);
    this.setState({ showBookmarks });
  };

  render() {
    let list = _.map(this.state.bookmarks, this.renderBookmark);
    const { showBookmarks } = this.state;

    return (
      <div id={'ic-bookmarks'} style={{left: showBookmarks ? '0' : '-200px'}}>
        <div id={'bookmark-button'}
             style={{left: showBookmarks ? '200px' : '0'}}
             onClick={this.toggleBookmarks}>
          <i className="material-icons">star_rate</i>
        </div>
        <div id="contents">
          <h1>Bookmarks</h1>
          <div id="ic-bookmark-list">
            {list}
          </div>
        </div>
      </div>
    );
  }
}
