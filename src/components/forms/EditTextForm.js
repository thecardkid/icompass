import React, { Component } from 'react';

import Socket from '../../utils/Socket';

import TextForm from './TextForm';

export default class EditTextForm extends Component {
  constructor() {
    super();
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

  render() {
    return (
      <TextForm title={this.props.title}
                defaultStyle={this.props.note.style}
                defaultText={this.props.note.text}
                submit={this.edit}
                close={this.props.close}
                bg={this.props.note.color}
      />
    );
  }
}
