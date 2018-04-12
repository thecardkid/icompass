import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Tappable from 'react-tappable/lib/Tappable';

import Modal from '../utils/Modal';
import Toast from '../utils/Toast';
import { REGEX } from '../../lib/constants';

export default class PromptName extends Component {
  constructor() {
    super();
    this.modal = new Modal();
    this.toast = new Toast();
  }

  componentDidMount() {
    this.promptForName();
  }

  promptForName = () => {
    const { code } = this.props.params;
    this.modal.promptForUsername(this.toast.warn, (name) => {
      if (name.length > 15 || !REGEX.CHAR_ONLY.test(name)) {
        this.toast.error('Username must be fewer than 15 characters and letters-only');
        return this.promptForName();
      }

      browserHistory.push(`/compass/edit/${code}/${name}`);
    });
  };

  render() {
    return (
      <Tappable onTap={this.toast.clear}>
        <div id="ic-toast" onClick={this.toast.clear} />
      </Tappable>
    );
  }
}
