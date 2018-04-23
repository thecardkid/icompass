import React, { Component } from 'react';

import TextForm from './TextForm';

import Socket from '../../utils/Socket';

export default class CreateTextForm extends Component {
  constructor() {
    super();
    this.socket = Socket.getInstance();
  }

  make = (text, isImage, style) => {
    if (!text) return;

    const { x, y } = this.props.info;
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

  render() {
    return (
      <TextForm title={this.props.title}
                defaultText={''}
                submit={this.make}
                close={this.props.close}
                bg={this.props.bg}
      />
    );
  }
}
