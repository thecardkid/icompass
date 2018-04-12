import React, { Component } from 'react';
import { Link } from 'react-router';

import Timer from '../components/Timer.jsx';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket.js';
import Storage from '../utils/Storage';

import { MODALS, HOST } from '../../lib/constants';

export default class SidebarActionsList extends Component {
  constructor(props, context) {
    super(props, context);
    this.modal = new Modal();
    this.socket = new Socket();
  }

  confirmDelete = () => {
    this.socket.emitMetric('sidebar delete compass');
    this.modal.confirm(MODALS.DELETE_COMPASS, (deleteCompass) => {
      if (deleteCompass) {
        Storage.removeBookmarkByCenter(this.props.compass.center);
        this.socket.emitDeleteCompass(this.props.compass._id);
      }
    });
  };

  togglePrivacyStatement = () => {
    this.socket.emitMetric('sidebar toggle privacy');
    this.modal.alertPrivacyStatement();
  };

  toggleFeedback = () => {
    this.socket.emitMetric('sidebar toggle feedback');
    this.modal.alertFeedback();
  };

  toTutorial = () => {
    this.socket.emitMetric('sidebar tutorial');
    window.open(`${HOST}tutorial`, '_blank').focus();
  };

  render() {
    return (
      <div className="ic-sidebar-list" name="actions">
        <h2>Actions</h2>
        <button name="privacy" className="ic-action" onClick={this.togglePrivacyStatement}>
          <i className="material-icons">lock</i>
          <p>privacy</p>
        </button>
        <button name="tutorial" className="ic-action">
          <Link onClick={this.toTutorial} to="/tutorial" target="_blank" rel="noopener noreferrer">
            <i className="material-icons">info</i>
            <p>tutorial</p>
          </Link>
        </button>
        <button name="sucks" className="ic-action" onClick={this.toggleFeedback}>
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
}
