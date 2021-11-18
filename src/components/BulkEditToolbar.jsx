import React, { Component } from 'react';
import Draggable from 'react-draggable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import * as uiX from '@actions/ui';
import * as workspaceX from '@actions/workspace';
import FormPalette from '@components/forms/FormPalette';
import Socket from '@utils/Socket';
import { trackFeatureEvent } from '@utils/analytics';
import { STICKY_COLORS } from '@utils/constants';

class BulkEditToolbar extends Component {
  socket = Socket.getInstance();

  state = {
    color: STICKY_COLORS[0],
  };

  getSelectedNotes = () => {
    const selected = [];
    _.each(this.props.notes, (n, i) => {
      if (this.props.workspace.selected[i]) selected.push(n._id);
    });
    return selected;
  };

  bulkDelete = (ev) => {
    ev.stopPropagation();
    this.props.uiX.openDeleteNotesModal();
  };

  cancel = () => {
    this.props.uiX.normalMode();
  };

  submit = (ev) => {
    ev.stopPropagation();
    let { color } = this.props.workspace;
    let transformation = { color };
    this.socket.emitBulkEditNotes(this.getSelectedNotes(), transformation);
    trackFeatureEvent('Bulk edit: Submit');
    this.cancel();
  };

  bulkColor = (color) => {
    this.props.workspaceX.colorAll(color);
    this.setState({ color });
    trackFeatureEvent('Bulk edit: Color');
  };

  render() {
    if (!this.props.show) {
      return null;
    }

    let warning;
    if (this.props.notes.length === 0) {
      warning = (
        <div className={'ic-modal-warning'}>
          To use this tool, first create some sticky notes.
        </div>
      );
    }

    return (
      <Draggable>
        <div id="ic-visual-toolbar">
          <div id={'header'}>
            Multi-Edit Toolbar
          </div>
          {warning}
          <div id={'explanation'}>
            <div>Select notes by holding Shift and clicking on individual notes. Alternatively, hold left click and drag across the workspace.</div>
            <div>Choose an action to perform on selected notes. Dragging one note will move all selected notes.</div>
          </div>
          <div id={'actions'}>
            <hr />
            <div className={'action update-color'}>
              Update color
              <FormPalette setColor={this.bulkColor} color={this.state.color}/>
            </div>
            <hr />
            <div className={'footer'}>
              <button className={'bulk-edit-btn cancel'} onClick={this.cancel}>
                Cancel
              </button>
              <button className={'bulk-edit-btn delete'} onClick={this.bulkDelete}>
                Delete all
              </button>
              <button className={'bulk-edit-btn submit'} onClick={this.submit}>
                Submit
              </button>
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(BulkEditToolbar);
