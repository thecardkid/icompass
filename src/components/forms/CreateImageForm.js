import React, { Component } from 'react';

import { trackFeatureEvent } from '../../utils/Analytics';
import Socket from '../../utils/Socket';
import ImageForm from './ImageForm';

export default class CreateImageForm extends Component {
  socket = Socket.getInstance();

  make = ({ imgSource, color, altText }, isDraft) => {
    if (!imgSource) return;

    const { x, y } = this.props.info;
    let note = {
      x, y, color, altText,
      text: imgSource,
      isImage: true,
      doodle: null,
      user: this.props.user,
    };

    if (isDraft) {
      this.props.asDraft(note);
      trackFeatureEvent('Create draft (image)');
    } else {
      this.props.asNote(note);
      trackFeatureEvent('Create note (image)');
    }
    this.props.close();
  };

  render() {
    return (
      <ImageForm title={this.props.title}
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
