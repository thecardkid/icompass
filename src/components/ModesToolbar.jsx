import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import Modal from '../utils/Modal';

import * as uiActions from '../actions/ui';

import { MODALS, EDITING_MODE } from '../../lib/constants';
import Socket from '../utils/Socket';

class ModesToolbar extends Component {
  constructor() {
    super();
    this.modal = Modal.getInstance();
    this.socket = Socket.getInstance();
  }

  changeMode = (mode) => {
    switch (mode) {
      case 'ic-mode-normal':
        this.socket.emitMetric('enter normal mode');
        return this.props.uiActions.normalMode();
      case 'ic-mode-compact':
        this.socket.emitMetric('enter compact mode');
        return this.props.uiActions.compactMode();
      case 'ic-mode-visual':
        this.socket.emitMetric('enter visual mode');
        return this.props.uiActions.visualMode(this.props.notes.length);
      case 'ic-mode-draft':
        this.socket.emitMetric('enter draft mode');
        return this.props.uiActions.draftMode();
      default:
        return;
    }
  };

  handleChangeMode = (e) => {
    let elemId = e.target.id;
    if (this.props.draftMode && elemId !== 'ic-mode-draft'
      && !_.isEmpty(this.props.drafts)) {
      this.modal.confirm(MODALS.EXIT_DRAFT_MODE, (exit) => {
        if (exit) this.changeMode(elemId);
      });
    } else {
      this.changeMode(elemId);
    }
  };

  render() {
    return (
      <div id="ic-modes">
        <button id="ic-mode-draft"
                data-tip data-for="draft-tooltip"
                className={this.props.draftMode ? 'selected' : 'unselected'}
                onClick={this.handleChangeMode}>
          Draft
        </button>
        <ReactTooltip id="draft-tooltip" place="left" effect="solid">
          <span>Draft notes and release them one at a time</span>
        </ReactTooltip>
        <button id="ic-mode-visual"
                data-tip data-for="visual-tooltip"
                className={this.props.visualMode ? 'selected' : 'unselected'}
                onClick={this.handleChangeMode}>
          Select
        </button>
        <ReactTooltip id="visual-tooltip" place="left" effect="solid">
          <span>Format many notes at once</span>
        </ReactTooltip>
        <button id="ic-mode-compact"
                data-tip data-for="compact-tooltip"
                className={this.props.compactMode ? 'selected' : 'unselected'}
                onClick={this.handleChangeMode}>
          Compact
        </button>
        <ReactTooltip id="compact-tooltip" place="bottom" effect="solid">
          <span>For smaller devices</span>
        </ReactTooltip>
        <button id="ic-mode-normal"
                data-tip data-for="normal-tooltip"
                className={this.props.normalMode ? 'selected' : 'unselected'}
                onClick={this.handleChangeMode}>
          Normal
        </button>
        <ReactTooltip id="normal-tooltip" place="bottom" effect="solid">
          <span>Ship notes as you go</span>
        </ReactTooltip>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    notes: state.notes,
    ui: state.ui,
    normalMode: state.ui.editingMode === EDITING_MODE.NORMAL || false,
    compactMode: state.ui.editingMode === EDITING_MODE.COMPACT || false,
    visualMode: state.ui.editingMode === EDITING_MODE.VISUAL || false,
    draftMode: state.ui.editingMode === EDITING_MODE.DRAFT || false,
    drafts: state.workspace.drafts || [],
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ModesToolbar);

