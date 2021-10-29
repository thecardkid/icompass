import React, { Component } from 'react';

import TextForm from './TextForm';

import { trackFeatureEvent } from '../../utils/analytics';
import Socket from '../../utils/Socket';

export default class CreateTextForm extends Component {
  socket = Socket.getInstance();

  make = (text, isImage, { style, color }, isDraft) => {
    if (!text) return;

    const { x, y } = this.props.info;
    let note = {
      text, isImage, x, y, style, color,
      doodle: null,
      user: this.props.user,
    };

    if (isDraft) {
      this.props.asDraft(note);
      trackFeatureEvent('Create draft (text)');
    } else {
      this.props.asNote(note);
      trackFeatureEvent('Create note (text)');
    }
    this.props.close();
  };

  render() {
    return (
      <TextForm title={this.props.title}
                defaultText={''}
                submit={this.make}
                close={this.props.close}
                bg={this.props.info.color || this.props.bg}
                switch={true}
                colors={true}
      />
    );
  }
}
