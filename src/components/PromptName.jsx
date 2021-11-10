import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';

import * as uiX from '@actions/ui';
import Modal from '@utils/Modal';

class PromptName extends Component {
  modal = Modal.getInstance();

  componentDidMount() {
    this.promptForName();
  }

  promptForName = () => {
    this.modal.promptForUsername(this.props.uiX.toastError, (name) => {
      browserHistory.push(`/compass/edit/${this.props.params.code}/${name}`);
    });
  };

  render() {
    return <div id={'ic-prompt-name'} />;
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PromptName);
