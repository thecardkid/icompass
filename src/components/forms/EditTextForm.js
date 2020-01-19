import React, { Component } from 'react';

import Socket from '../../utils/Socket';

import TextForm from './TextForm';

export default class EditTextForm extends Component {
  constructor() {
    super();
    this.socket = Socket.getInstance();
  }

  edit = (text, isImage, { style, color }, isDraft) => {
    if (!text) return;

    const edited = {
      ...this.props.info,
      text,
      isImage,
      style,
      color,
    };
    const { idx } = edited;
    delete edited.idx;

    if (isDraft === false && this.props.info.draft === true) {
      this.props.submitDraft(idx);
      delete edited.draft;
      edited.color = this.props.color;
      /* Can't submit draft in visual mode, no need to check */
      this.socket.emitNewNote(edited);
      this.socket.emitMetric('draft submit');
    }

    this.socket.emitMetric('note edit');
    this.props.ship(edited, idx);
    this.props.close();
  };

  render() {
    return (
      <TextForm title={this.props.title}
                defaultStyle={this.props.info.style}
                defaultText={this.props.info.text}
                submit={this.edit}
                close={this.props.close}
                bg={this.props.info.color}
                switch={false}
                colors={!this.props.info.draft}
      />
    );
  }
}
