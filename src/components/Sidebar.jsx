import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory, Link } from 'react-router';
import Swipeable from 'react-swipeable';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import Timer from '../components/Timer.jsx';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket.js';
import Storage from '../utils/Storage';
import Toast from '../utils/Toast';

import * as uiX from '../actions/ui';
import * as workspaceX from '../actions/workspace';

import { VERSION, TWEET, HOST, PROMPTS, MODALS, PIXELS, COLORS, REGEX } from '../../lib/constants';

class Sidebar extends Component {
  constructor(props, context) {
    super(props, context);
    this.toast = new Toast();
    this.modal = new Modal();
    this.socket = new Socket(this);

    this.socket.subscribe({
      'start timer': this.onStartTimer,
      'all cancel timer': this.onCancelTimer,
    });
  }

  onStartTimer = (min, sec, startTime) => {
    this.props.workspaceX.setTimer({ min, sec, startTime });
    this.toast.info(PROMPTS.TIMEBOX(min, sec));
  };

  onCancelTimer = () => {
    this.props.workspaceX.setTimer({});
    this.toast.info(PROMPTS.TIMEBOX_CANCELED);
  };

  shouldComponentUpdate(nextProps) {
    if (this.props.users !== nextProps.users)
      return true;

    if (this.props.users && this.props.users.length !== nextProps.users.length)
      return true;

    return (
      this.props.connected !== nextProps.connected ||
      this.props.show !== nextProps.show ||
      this.props.you !== nextProps.you
    );
  }

  renderUserColor(color, username) {
    let label = username === this.props.you ? `You [ ${username} ]` : username;
    return (
      <p key={username} className="ic-user" style={{ background: color }}>
        {label}
      </p>
    );
  }

  exportCompass = () => {
    this.props.uiX.setSidebarVisible(false);
    this.props.uiX.setChatVisible(false);

    setTimeout(() => {
      html2canvas(document.body).then((canvas) => {
        let imgData = canvas.toDataURL('image/png');
        let doc = new jsPDF('l', 'cm', 'a4');
        doc.addImage(imgData, 'PNG', 0, 0, 30, 18);
        doc.save('compass.pdf');
      });
    }, 500);
  };

  showSavePrompt = () => {
    this.modal.confirm(MODALS.EXPORT_PDF, (exportAsPDF) => {
      if (exportAsPDF) this.exportCompass();
    });
  };

  shareEditLink = () => {
    this.modal.alert(MODALS.SHARE_LINK(`${HOST}compass/edit/${this.props.compass.editCode}`));
  };

  shareViewOnlyLink = () => {
    this.modal.alert(MODALS.SHARE_LINK(`${HOST}compass/view/${this.props.compass.viewCode}`));
  };

  tweetThis = () => {
    let tweetURL = TWEET + this.props.compass.viewCode;
    window.open(tweetURL, '_blank').focus();
  };

  confirmDelete = () => {
    this.modal.confirm(MODALS.DELETE_COMPASS, (deleteCompass) => {
      if (deleteCompass) {
        Storage.removeBookmarkByCenter(this.props.compass.center);
        this.socket.emitDeleteCompass();
      }
    });
  };

  triggerEmailModal = () => {
    this.emailReminder();
  };

  emailReminder = (text) => {
    this.modal.prompt(text || 'Enter your email below to receive a reminder link to this workspace:', (status, email) => {
      if (!status) return;

      if (REGEX.EMAIL.test(email)) {
        return this.socket.emitSendMail(this.props.compass.editCode, this.props.you, email);
      }

      this.emailReminder(`"${email}" does not look right - make sure you type your email address correctly:`);
    });
  };

  openNewCompass() {
    window.open(HOST, '_blank').focus();
  }

  renderShareList = () => {
    return (
      <div className="ic-sidebar-list" name="share">
        <h2>Share</h2>
        <button className="ic-action" onClick={this.openNewCompass}>
          <i className="material-icons">add_circle</i>
          <p>create new</p>
        </button>
        <button name="save" className="ic-action bookmark" onClick={this.save}>
          <i className="material-icons">star</i>
          <p>bookmark</p>
        </button>
        <button name="email" className="ic-action" onClick={this.triggerEmailModal}>
          <i className="fa fa-envelope" />
          <p>email</p>
        </button>
        <button name="share-edit" id={this.props.compass.editCode} className="ic-action" onClick={this.shareEditLink}>
          <i className="material-icons">edit</i>
          <p>editing link</p>
        </button>
        <button name="share-view" id={this.props.compass.viewCode} className="ic-action"
                onClick={this.shareViewOnlyLink}>
          <i className="material-icons">remove_red_eye</i>
          <p>view-only link</p>
        </button>
        <button name="export" className="ic-action" onClick={this.showSavePrompt}>
          <i className="material-icons">picture_as_pdf</i>
          <p>export to pdf</p>
        </button>
        <button name="tweet" className="ic-action tweet" onClick={this.tweetThis}>
          <i className="fa fa-twitter" style={{ color: 'white' }} />
          <p>tweet this</p>
        </button>
      </div>
    );
  };

  renderControlList = () => {
    return (
      <div className="ic-sidebar-list" name="controls">
        <h2>Controls</h2>
        <button className="ic-action" onClick={() => this.props.uiX.showNewNote()}>
          <span className='ic-ctrl-key'>n</span>
          <p>new note</p>
        </button>
        <button className="ic-action" onClick={this.props.uiX.showDoodle}>
          <span className='ic-ctrl-key'>d</span>
          <p>new doodle</p>
        </button>
        <button className="ic-action" onClick={this.props.uiX.toggleSidebar}>
          <span className='ic-ctrl-key'>s</span>
          <p>toggle sidebar</p>
        </button>
        <button className="ic-action" onClick={this.props.uiX.toggleChat}>
          <span className='ic-ctrl-key'>c</span>
          <p>toggle chat</p>
        </button>
        <button className="ic-action" onClick={this.props.uiX.toggleAbout}>
          <span className='ic-ctrl-key'>p</span>
          <p>toggle prompt</p>
        </button>
      </div>
    );
  };

  renderUserList = () => {
    let userList = _.map(this.props.users, this.renderUserColor.bind(this));
    return (
      <div className="ic-sidebar-list" name="users">
        <h2>Collaborators</h2>
        {userList}
      </div>
    );
  };

  renderConnectionStatus = () => {
    let connectionStatus = this.socket.isConnected() ?
      <p style={{ color: COLORS.GREEN }}>connected</p> :
      <p style={{ color: COLORS.RED }}>disconnected</p>;
    return (
      <div className="ic-sidebar-list" name="status">
        <h2>Status - {connectionStatus}</h2>
        <button name="logout" className="ic-action" onClick={this.logout}>
          <i className="material-icons">lock</i>
          <p>log out</p>
        </button>
      </div>
    );
  };

  save = () => {
    const { topic, editCode } = this.props.compass;
    this.modal.prompt(MODALS.SAVE_BOOKMARK, (submit, bookmarkName) => {
      if (submit) {
        let username = this.props.you.replace(/\d+/g, '');
        Storage.addBookmark(bookmarkName, editCode, username);
        this.toast.success(PROMPTS.SAVE_SUCCESS);
      }
    }, topic);
  };

  logout() {
    browserHistory.push('/');
  }

  renderActionList() {
    return (
      <div className="ic-sidebar-list" name="actions">
        <h2>Actions</h2>
        <button name="privacy" className="ic-action" onClick={this.props.uiX.togglePrivacyStatement}>
          <i className="material-icons">lock</i>
          <p>privacy</p>
        </button>
        <button name="tutorial" className="ic-action"><Link to="/tutorial" target="_blank" rel="noopener noreferrer">
          <i className="material-icons">info</i>
          <p>tutorial</p>
        </Link></button>
        <button name="sucks" className="ic-action" onClick={this.props.uiX.toggleFeedback}>
          <i className="material-icons">chat_bubble</i>
          <p>feedback</p>
        </button>
        <Timer stop={this.socket.emitCancelTimer}/>
        <button name="destroyer" className="ic-action dangerous" onClick={this.confirmDelete}>
          <i className="material-icons" style={{ color: 'white' }}>delete</i>
          <p>delete</p>
        </button>
      </div>
    );
  }

  renderCreditsList() {
    return (
      <div className="ic-sidebar-list" name="credits">
        <h2>Credits</h2>
        <p name="ela">compass by
          <Link to="http://innovatorscompass.org" target="_blank" rel="noopener noreferrer"> Ela Ben-Ur</Link>
        </p>
        <p name="hieu">app by
          <Link href="http://hieuqn.com" target="_blank" rel="noopener noreferrer"> Hieu Nguyen</Link>
        </p>
      </div>
    );
  }

  renderVersionList() {
    return (
      <div className="ic-sidebar-list" name="version">
        <h2>iCompass {VERSION}</h2>
        <p>
          <Link to="https://github.com/thecardkid/innovators-compass/releases" target="_blank"
                rel="noopener noreferrer">changelog</Link>
        </p>
      </div>
    );
  }

  render() {
    let style = { left: this.props.show ? PIXELS.SHOW : PIXELS.HIDE_SIDEBAR };

    return (
      <div id="ic-sidebar" style={style}>
        <Swipeable onSwipedLeft={this.props.uiX.toggleSidebar}>
          <div id="ic-sidebar-scroll">
            <div id="ic-sidebar-contents">
              <button name="close-sidebar" className="ic-close-window" onClick={this.props.uiX.toggleSidebar}>x
              </button>
              {this.renderShareList()}
              {this.renderControlList()}
              {this.renderUserList()}
              {this.renderConnectionStatus()}
              {this.renderActionList()}
              {this.renderCreditsList()}
              {this.renderVersionList()}
            </div>
          </div>
        </Swipeable>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    users: state.users.nameToColor,
    you: state.users.me,
    show: state.ui.showSidebar,
    compass: state.compass,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uiX: bindActionCreators(uiX, dispatch),
    workspaceX: bindActionCreators(workspaceX, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);

