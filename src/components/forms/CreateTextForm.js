import React, { Component } from 'react';

import TextForm from './TextForm';

import Modal from '../../utils/Modal';
import Toast from '../../utils/Toast';
import Socket from '../../utils/Socket';

export default class CreateTextForm extends Component {
  constructor(props) {
    super(props);
    this.toast = Toast.getInstance();
    this.modal = Modal.getInstance();
    this.socket = Socket.getInstance();
  }

  make = (text, isImage, style) => {
    if (!text) return;

    let x = 0.5, y = 0.5;
    if (typeof this.props.position === 'object') {
      x = this.props.position.x;
      y = this.props.position.y;
    }

    let note = {
      text, isImage, x, y, style,
      doodle: null,
      color: this.props.bg,
      user: this.props.user,
    };

    this.socket.emitMetric(`note ${isImage ? 'image' : 'create'}`);
    this.props.ship(note);
    this.props.close();
  };

  getHeader(mode) {
    switch (mode) {
      case 'make':
        return 'Create a note';
      case 'make draft':
        return 'Create a draft';
      default:
        return '';
    }
  }

  render() {
    return (
      <TextForm title={this.getHeader(this.props.mode)} defaultText={''}
                submit={this.make} close={this.props.close}
                bg={this.props.bg}
      />
    );
  }
}
