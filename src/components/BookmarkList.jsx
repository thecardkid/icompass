import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import _ from 'underscore';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket';
import Storage from '../utils/Storage';
import ToastSingleton from '../utils/Toast';

import { MODALS } from '../../lib/constants';

export default class BookmarkList extends Component {
  constructor(props) {
    super(props);
    this.modal = Modal.getInstance();
    this.socket = Socket.getInstance();
    this.toast = ToastSingleton.getInstance();

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

  importBookmarks = (e) => {
    const file = e.target.files[0];

    if (file.type !== 'application/json') {
      return this.toast.error('Invalid file type - must be .json file');
    }

    const reader = new FileReader();
    reader.onload = this.onReaderLoad;
    reader.readAsText(file);
    e.target.value = null;
  };

  isValidBookmark({ center, href, name }) {
    if (!center || !href || !name) {
      return false;
    }

    const hrefRegex = /^\/compass\/edit\/[a-zA-Z0-9]{8}\/[a-zA-Z]{1,15}$/;
    if (!hrefRegex.test(href)) return false;

    const usernameRegex = /^[a-zA-Z]{1,15}$/;
    return usernameRegex.test(name);
  }

  onReaderLoad = (ev) => {
    const uploadedJSON = ev.target.result;

    try {
      const bookmarks = JSON.parse(uploadedJSON);

      if (_.isEmpty(bookmarks)) {
        return this.toast.info('Nothing happened - the file was empty');
      }

      const validBookmarks = [];
      for (let i = 0; i < bookmarks.length; i++) {
        const { center, href, name } = bookmarks[i];
        if (!this.isValidBookmark({ center, href, name })) {
          throw new Error;
        }

        validBookmarks.push({ center, href, name });
      }

      Storage.addAllBookmarks(validBookmarks);

      const newBookmarks = Storage.getBookmarks();

      this.setState({
        bookmarks: newBookmarks,
        show: new Array(newBookmarks.length).fill(false),
      });
      this.toast.success('Bookmarks imported!');
    } catch (ex) {
      this.modal.alert('<h3>Whoops</h3><p>The file you uploaded does not have the correct format. Please export your bookmarks again and retry with the new file.</p>');
    }
  };

  exportBookmarks = () => {
    this.modal.prompt(
      '<h3>Export bookmarks</h3><p>Enter a name for the file:</p>',
      (accepted, filename) => {
        if (!accepted || !filename) return;

        const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(Storage.getBookmarks()));
        const anchor = this.refs.exporter;
        anchor.setAttribute('href', data);
        anchor.setAttribute('download', `${filename}.json`);
        anchor.click();
      },
      'icompass-bookmarks',
    );
  };

  clickFile = () => {
    this.refs.importer.click();
  };

  render() {
    let list = _.map(this.state.bookmarks, this.renderBookmark);
    const { showBookmarks } = this.state;

    return (
      <div id={'ic-bookmarks'} style={{left: showBookmarks ? '0' : '-200px'}}>
        <div id={'bookmark-button'}
             style={{left: showBookmarks ? '200px' : '0'}}
             onClick={this.toggleBookmarks}>
          <i className="material-icons">bookmark</i>
        </div>
        <div id="contents">
          <h1>Bookmarks</h1>
          <div id="ic-bookmark-list">
            {list}
          </div>
        </div>
        <div id={'ic-bookmark-footer'}>
          <button id={'import'} onClick={this.clickFile}>Import</button>
          <button id={'export'} onClick={this.exportBookmarks}>Export</button>
          <a className={'hidden'} ref={'exporter'} />
          <input className={'hidden'}
                 type={'file'}
                 ref={'importer'}
                 multiple={false}
                 onChange={this.importBookmarks}/>
        </div>
      </div>
    );
  }
}
