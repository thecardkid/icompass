import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';
import ReactTooltip from 'react-tooltip';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import * as uiX from '@actions/ui';
import getAPIClient from '@utils/api';
import { modalCheckEmail } from '@utils/regex';
import Socket from '@utils/Socket';
import Storage from '@utils/Storage';

import Bookmark from './Bookmark';
import { DeleteBookmarkModal } from './modals/ConfirmDelete';
import { EditBookmarkPrompt, EmailBookmarksPrompt } from './modals/Prompt';

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

  edit = (idx) => (e) => {
    e.stopPropagation();
    ReactGA.modalview('modals/bookmarks-edit');
    this.props.uiX.openEditBookmarkModal();
    this.props.uiX.setModalExtras({ editBookmarkIndex: idx });
  };

  editBookmark = (value) => {
    const bookmarks = Storage.updateName(this.props.ui.modalExtras.editBookmarkIndex, value);
    this.setState({ bookmarks });
  };

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

  renderBookmark = (w, idx) => {
    return (
      <Bookmark expand={this.expand(idx)}
                remove={this.remove(idx)}
                onSortItems={this.onSort}
                items={this.state.bookmarks}
                sortId={idx}
                edit={this.edit(idx)}
                w={w}
                key={idx}
                show={this.state.show[idx]}
      />
    );
  };

  toggleBookmarks = () => {
    const showBookmarks = Storage.setShowBookmarks(!this.state.showBookmarks);
    this.setState({ showBookmarks });
  };

  clickFile = () => {
    this.refs.importer.click();
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

  onSort = (bookmarks) => {
    Storage.setBookmarks(bookmarks);
    this.setState({ bookmarks });
  };

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
        <EditBookmarkPrompt onSubmit={this.editBookmark} />
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
