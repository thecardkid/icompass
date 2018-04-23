import React, { Component } from 'react';

import Socket from '../../utils/Socket';
import ImageForm from './ImageForm';

export default class EditImageForm extends Component {
  constructor(props) {
    super(props);
    this.socket = Socket.getInstance();
  }

  edit = (url) => {
    if (!url) return;

    const edited = {
      ...this.props.note,
      text: url,
    };

    this.socket.emitMetric('note image edit');
    this.props.ship(edited, this.props.idx);
    this.props.close();
  };

  render() {
    return (
      <ImageForm title={this.props.title} defaultUrl={this.props.note.text}
                submit={this.edit} close={this.props.close}
                bg={this.props.note.color}
      />
    );
  }
}
