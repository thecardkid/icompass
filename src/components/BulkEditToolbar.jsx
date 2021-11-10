import React, { Component } from 'react';
import Draggable from 'react-draggable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import * as uiX from '@actions/ui';
import * as workspaceX from '@actions/workspace';
import FormPalette from '@components/forms/FormPalette';
import Modal from '@utils/Modal';
import Socket from '@utils/Socket';
import Storage from '@utils/Storage';
import { trackFeatureEvent } from '@utils/analytics';
import { STICKY_COLORS } from '@utils/constants';

class BulkEditToolbar extends Component {
  modal = Modal.getInstance();
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
    this.modal.confirm({
      body: 'You are about to delete all selected notes. This action cannot be undone.',
      confirmText: 'Delete',
      cb: (confirmed) => {
        if (confirmed) {
          trackFeatureEvent('Bulk edit: Delete');
          this.socket.emitBulkDeleteNotes(this.getSelectedNotes());
          this.cancel();
        }
      },
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
    trackFeatureEvent('Bulk edit: Submit');
    this.cancel();
  };

  bulkColor = (color) => {
    this.props.workspaceX.colorAll(color);
    this.setState({ color });
    trackFeatureEvent('Bulk edit: Color');
  };

  render() {
    if (!this.props.show) return null;

    return (
      <Draggable>
        <div id="ic-visual-toolbar">
          <div id={'header'}>
            Multi-Edit Toolbar
          </div>
          <div id={'explanation'}>
            <div>Choose an action to perform on selected notes. Moving one selected note will move all selected notes.</div>
            <div>Select notes by click-dragging, or by holding Shift and clicking on individual notes.</div>
          </div>
          <div id={'actions'}>
            <hr />
            <div className={'action update-color'}>
              Update color
              <FormPalette setColor={this.bulkColor} color={this.state.color}/>
            </div>
            <hr />
            <div className={'action'}>
              <button className={'bulk-edit-btn cancel'} onClick={this.cancel}>
                Cancel
              </button>
            </div>
            <div className={'action'}>
              <button className={'bulk-edit-btn submit'} onClick={this.submit}>
                Apply changes
              </button>
            </div>
            <div className={'action'}>
              <button className={'bulk-edit-btn delete'} onClick={this.bulkDelete}>
                Delete all
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
