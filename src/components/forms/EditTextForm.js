import React, { Component } from 'react';

import Modal from '../../utils/Modal';
import Toast from '../../utils/Toast';
import Socket from '../../utils/Socket';

import TextForm from './TextForm';

export default class EditTextForm extends Component {
  constructor(props) {
    super(props);
    this.toast = Toast.getInstance();
    this.modal = Modal.getInstance();
    this.socket = Socket.getInstance();
  }

  edit = (text, isImage, style) => {
    if (!text) return;

    const edited = {
      ...this.props.note,
      text,
      isImage,
      style,
    };

    this.socket.emitMetric('note edit');
    this.props.ship(edited, this.props.idx);
    this.props.close();
  };

  getHeader(mode) {
    switch (mode) {
      case 'edit':
        return 'Edit this note';
      case 'edit draft':
        return 'Edit this draft';
      default:
        return '';
    }
  }

  render() {
    return (
      <TextForm title={this.getHeader(this.props.mode)}
                defaultStyle={this.props.note.style}
                defaultText={this.props.note.text}
                submit={this.edit}
                close={this.props.close}
                bg={this.props.note.color || this.props.bg}
      />
    );
  }
}
