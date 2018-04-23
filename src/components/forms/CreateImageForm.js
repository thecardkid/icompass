import React, { Component } from 'react';

import Socket from '../../utils/Socket';
import ImageForm from './ImageForm';

export default class CreateImageForm extends Component {
  constructor(props) {
    super(props);
    this.socket = Socket.getInstance();
  }

  make = (url) => {
    if (!url) return;

    let x = 0.5, y = 0.5;
    if (typeof this.props.position === 'object') {
      x = this.props.position.x;
      y = this.props.position.y;
    }

    let note = {
      x, y,
      text: url,
      isImage: true,
      doodle: null,
      color: this.props.bg,
      user: this.props.user,
      style: {
        bold: false,
        italic: false,
        underline: false,
      },
    };

    this.socket.emitMetric('note image');
    this.props.ship(note);
    this.props.close();
  };

  render() {
    return (
      <ImageForm title={this.props.title} defaultText={''}
                submit={this.make} close={this.props.close}
                bg={this.props.bg}
      />
    );
  }
}
