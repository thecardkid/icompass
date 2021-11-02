import React, { Component } from 'react';
import Draggable from 'react-draggable';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import FormPalette from './forms/FormPalette';
import { trackFeatureEvent } from '@utils/analytics';
import Modal from '@utils/Modal';
import Socket from '@utils/Socket';
import Storage from '@utils/Storage';
import * as uiX from '@actions/ui';
import * as workspaceX from '@actions/workspace';

class BulkEditToolbar extends Component {
  modal = Modal.getInstance();
  socket = Socket.getInstance();

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
    trackFeatureEvent('Bulk edit: Color');
  };

  render() {
    if (!this.props.show) return null;

    const tooltipType = Storage.getTooltipTypeBasedOnDarkTheme();

    return (
      <Draggable>
        <div id="ic-visual-toolbar">
          <div id={'header'}>
            Bulk Edit Toolbar
          </div>
          <hr />
          <div id={'actions'}>
            <button id="ic-bulk-delete"
                    onClick={this.bulkDelete}
                    data-tip="Delete notes"
                    data-for="bulk-delete-tooltip">
              <i className={'material-icons'}>delete</i>
            </button>
            <ReactTooltip id={'bulk-delete-tooltip'} place={'bottom'} effect={'solid'} type={tooltipType} delayShow={100}/>

            <div data-tip="Color notes"
                 data-for="bulk-color-tooltip">
              <FormPalette setColor={this.bulkColor} color={this.props.workspace.color}/>
            </div>
            <ReactTooltip id={'bulk-color-tooltip'} place={'bottom'} effect={'solid'} type={tooltipType} delayShow={100}/>

            <button id="ic-bulk-submit"
                    onClick={this.submit}
                    data-tip="Save"
                    data-for="bulk-commit">
              <i className={'material-icons'}>check</i>
            </button>
            <ReactTooltip id={'bulk-commit'} place={'bottom'} effect={'solid'} type={tooltipType} delayShow={100}/>
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
