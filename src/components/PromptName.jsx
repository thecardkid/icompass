'use strict';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import Modal from '../utils/Modal.jsx';
import { PROMPTS, REGEX } from '../../lib/constants';

export default class PromptName extends Component {
  componentDidMount() {
    this.modal = new Modal();
    this.promptForName('Welcome to Innovators\' Compass. Please enter your name as it would appear to others in this workspace.');
  }

  promptForName = (prefix) => {
    const { code } = this.props.params;
    const text = `${prefix} ${PROMPTS.PROMPT_NAME}`;

    this.modal.prompt(text, (submit, name) => {
      if (!submit) return browserHistory.push('/');

      if (name.length > 15 || !REGEX.CHAR_ONLY.test(name)) {
        return this.promptForName(`"${name}" is not valid.`);
      }

      browserHistory.push(`/compass/edit/${code}/${name}`);
    });
  };

  render() {
    return <div/>;
  }
}

PromptName.propTypes = {
  params: PropTypes.object.isRequired,
};
