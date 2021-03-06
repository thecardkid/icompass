import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import { trackFeatureEvent } from '../utils/Analytics';
import Modal from '../utils/Modal';
import Toast from '../utils/Toast';
import Socket from '../utils/Socket';
import { REGEX } from '../../lib/constants';

export default class PromptName extends Component {
  modal = Modal.getInstance();
  toast = Toast.getInstance();
  socket = Socket.getInstance();

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


      const url = `/compass/edit/${code}/${name}`;
      trackFeatureEvent('Use edit link');
      browserHistory.push(url);
    });
  };

  render() {
    return <div />;
  }
}
