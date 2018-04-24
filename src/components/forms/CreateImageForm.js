import React, { Component } from 'react';

import Socket from '../../utils/Socket';
import ImageForm from './ImageForm';

export default class CreateImageForm extends Component {
  constructor(props) {
    super(props);
    this.socket = Socket.getInstance();
  }

  make = (url, isDraft) => {
    if (!url) return;

    const { x, y } = this.props.info;
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
    if (isDraft) this.props.asDraft(note);
    else this.props.asNote(note);
    this.props.close();
  };

  render() {
    return (
      <ImageForm title={this.props.title}
                 defaultText={''}
                 submit={this.make}
                 close={this.props.close}
                 bg={this.props.bg}
                 switch={true}
      />
    );
  }
}
