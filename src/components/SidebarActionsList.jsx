import React, { Component } from 'react';
import { Link } from 'react-router';

import Timer from '../components/Timer.jsx';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket.js';

import { MODALS } from '../../lib/constants';

export default class SidebarActionsList extends Component {
  constructor(props, context) {
    super(props, context);
    this.modal = new Modal();
    this.socket = new Socket();
  }

  confirmDelete = () => {
    this.modal.confirm(MODALS.DELETE_COMPASS, (deleteCompass) => {
      if (deleteCompass) {
        Storage.removeBookmarkByCenter(this.props.compass.center);
        this.socket.emitDeleteCompass(this.props.compass._id);
      }
    });
  };

  render() {
    const {
      togglePrivacyStatement,
      toggleFeedback,
    } = this.props.uiX;

    return (
      <div className="ic-sidebar-list" name="actions">
        <h2>Actions</h2>
        <button name="privacy" className="ic-action" onClick={togglePrivacyStatement}>
          <i className="material-icons">lock</i>
          <p>privacy</p>
        </button>
        <button name="tutorial" className="ic-action"><Link to="/tutorial" target="_blank" rel="noopener noreferrer">
          <i className="material-icons">info</i>
          <p>tutorial</p>
        </Link></button>
        <button name="sucks" className="ic-action" onClick={toggleFeedback}>
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
