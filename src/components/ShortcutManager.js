import $ from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as uiX from '../actions/ui';

import SocketSingleton from '../utils/Socket';

import { KEYCODES } from '../../lib/constants';
import ModalSingleton from '../utils/Modal';

class ShortcutManager extends Component {
  constructor() {
    super();
    this.socket = SocketSingleton.getInstance();
    this.modal = ModalSingleton.getInstance();
  }

  componentDidMount() {
    $(window).on('keydown', this.keydown);
  }

  componentWillUnmount() {
    $(window).off('keydown', this.keydown);
  }

  keydown = (e) => {
    if (this.modal.show && e.which === KEYCODES.ESC) {
      return this.modal.close();
    }

    if (this.props.noteFormVisible || this.props.doodleFormVisible) {
      if (e.which === KEYCODES.ESC) {
        this.props.uiX.closeForm();
      }
      return;
    }

    if (document.activeElement.id === 'message-text') return;
    if (document.activeElement.id === 'ic-modal-input') return;


    this.props.handle(e);
  };

  render() {
    return <div/>;
  }
}

const mapStateToProps = (state) => {
  return {
    noteFormVisible: state.ui.forms.newText || (typeof state.ui.forms.editText === 'number'),
    doodleFormVisible: state.ui.forms.newDoodle,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShortcutManager);
