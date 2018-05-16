import React, { Component } from 'react';
import Draggable from 'react-draggable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import Modal from '../utils/Modal';

import * as uiX from '../actions/ui';
import * as workspaceX from '../actions/workspace';

import { MODALS } from '../../lib/constants';
import Socket from '../utils/Socket';
import FormPalette from './forms/FormPalette';

class VisualModeToolbar extends Component {
  constructor(props) {
    super(props);
    this.modal = Modal.getInstance();
    this.socket = Socket.getInstance();
  }

  getSelectedNotes = () => {
    const selected = [];
    _.each(this.props.notes, (n, i) => {
      if (this.props.workspace.selected[i]) selected.push(n._id);
    });
    return selected;
  };

  bulkDelete = (ev) => {
    ev.stopPropagation();
    this.modal.confirm(MODALS.BULK_DELETE_NOTES, (deleteNotes) => {
      if (deleteNotes) {
        this.socket.emitBulkDeleteNotes(this.getSelectedNotes());
        this.cancel();
      }
    });
  };

  cancel = () => {
    this.props.uiX.normalMode();
  };

  submit = (ev) => {
    ev.stopPropagation();
    let { color } = this.props.workspace;
    let transformation = { color };
    this.socket.emitBulkEditNotes(this.getSelectedNotes(), transformation);
    this.cancel();
  };

  bulkColor = (color) => {
    this.props.workspaceX.colorAll(color);
  };

  render() {
    if (!this.props.show) return null;

    return (
      <Draggable>
        <div id="ic-visual-toolbar">
          <div>
            <button id="ic-bulk-submit" onClick={this.submit}>
              <i className={'material-icons'}>check</i>
            </button>
            <FormPalette setColor={this.bulkColor} color={this.props.workspace.color}/>
            <button id="ic-bulk-delete" onClick={this.bulkDelete}>
              <i className={'material-icons'}>delete</i>
            </button>
          </div>
        </div>
      </Draggable>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    notes: state.notes,
    ui: state.ui,
    workspace: state.workspace,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
    workspaceX: bindActionCreators(workspaceX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VisualModeToolbar);
