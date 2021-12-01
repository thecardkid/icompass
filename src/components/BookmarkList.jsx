import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';
import { browserHistory } from 'react-router';
import ReactTooltip from 'react-tooltip';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import * as uiX from '@actions/ui';
import getAPIClient from '@utils/api';
import { modalCheckEmail } from '@utils/regex';
import Socket from '@utils/Socket';
import Storage from '@utils/Storage';

import { DeleteBookmarkModal } from './modals/ConfirmDelete';
import { EmailBookmarksPrompt } from './modals/Prompt';

class BookmarkList extends Component {
  constructor(props) {
    super(props);
    this.socket = Socket.getInstance();

    let b = Storage.getBookmarks();
    this.state = {
      bookmarks: b,
      show: new Array(b.length).fill(false),
      showBookmarks: Storage.getShowBookmarks(),
    };
  }

  remove = (idx) => (e) => {
    e.stopPropagation();
    ReactGA.modalview('modals/bookmarks-remove');
    this.props.uiX.openDeleteBookmarkModal();
    this.props.uiX.setModalExtras({ deleteBookmarkIndex: idx });
  };

  deleteBookmark = () => {
    const idx = this.props.ui.modalExtras.deleteBookmarkIndex;
    const bookmarks = Storage.removeBookmark(idx);
    const show = this.state.show;
    show.splice(idx, 1);
    this.setState({ bookmarks, show });
  };

  expand = (idx) => () => {
    let show = this.state.show;
    show[idx] = !show[idx];
    this.setState({ show });
  };

  openBookmark = (url) => {
    if (Storage.isBookmarkDeprecationReminderEnabled()) {
      this.props.uiX.showBookmarkDeprecationModal();
    }
    browserHistory.push(url);
  };

  renderBookmark = (w, idx) => {
    return (
      <li className={'ic-saved'} key={idx}>
        <a onClick={() => this.openBookmark(w.href)}>{w.center}</a>
        <span className={'delete'} onClick={this.remove(idx)}>
          <i className={'material-icons'}>close</i>
        </span>
      </li>
    );
  };

  toggleBookmarks = () => {
    const showBookmarks = !this.state.showBookmarks;
    Storage.setShowBookmarks(showBookmarks);
    this.setState({ showBookmarks });
  };

  openEmailBookmarksModal = () => {
    ReactGA.modalview('modals/bookmarks-email');
    this.props.uiX.openEmailBookmarksModal();
  };

  emailBookmarks = async (email) => {
    await getAPIClient().sendBookmarksEmail({
      bookmarks: this.state.bookmarks,
      recipientEmail: email,
    });
  }

  filter = (e) => {
    const search = e.target.value.toLowerCase();
    const storageBookmarks = Storage.getBookmarks();

    let bookmarks;
    if (search) {
      bookmarks = _.filter(storageBookmarks, bookmark => {
        const name = bookmark.center.toLowerCase();
        return name.includes(search);
      });
    } else {
      bookmarks = storageBookmarks;
    }
    this.setState({ bookmarks });
  };

  renderActions = () => {
    return (
      <div className={'actions'}>
        <button id={'email'} onClick={this.openEmailBookmarksModal} data-tip data-for="email-tooltip">
          <i className={'material-icons'}>email</i>
        </button>
        <ReactTooltip id={'email-tooltip'} place={'right'} effect={'solid'}>
          <div className={'bookmark-tooltip'}>
            Receive an email with a list of all your bookmarks
          </div>
        </ReactTooltip>
      </div>
    );
  };

  render() {
    let list = _.map(this.state.bookmarks, this.renderBookmark);
    const { showBookmarks } = this.state;

    return (
      <div id={'ic-bookmarks'} style={{left: showBookmarks ? '0' : '-200px'}}>
        <EmailBookmarksPrompt onSubmit={this.emailBookmarks}
                              validateFn={modalCheckEmail} />
        <DeleteBookmarkModal onConfirm={this.deleteBookmark} />
        <div id={'bookmark-button'}
             style={{left: showBookmarks ? '200px' : '0'}}
             onClick={this.toggleBookmarks}>
          <i className="material-icons">bookmark</i>
        </div>
        <div id="contents">
          <h1>Bookmarks</h1>
          <input placeholder={'Search'}
                 id={'bookmark-search'}
                 onChange={this.filter} />
          {this.renderActions()}
          <ul className={'sortable-list'}>{list}</ul>
        </div>
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    ui: state.ui,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BookmarkList);
