import React, { Component } from 'react';
import Draggable from 'react-draggable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import Modal from '../utils/Modal';

import * as uiActions from '../actions/ui';
import * as workspaceActions from '../actions/workspace';

import { COLORS, MODALS } from '../../lib/constants';
import Socket from '../utils/Socket';
import FormPalette from './forms/FormPalette';

const SELECTED = {
  background: COLORS.DARK,
  color: 'white',
};

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

  bulkDelete = () => {
    this.socket.emitMetric('visual mode bulk delete');
    this.modal.confirm(MODALS.BULK_DELETE_NOTES, (deleteNotes) => {
      if (deleteNotes) {
        this.socket.emitBulkDeleteNotes(this.getSelectedNotes());
        this.cancel();
      }
    });
  };

  cancel = () => {
    this.socket.emitMetric('enter normal mode');
    this.props.uiActions.normalMode();
  };

  submit = () => {
    let { bold, italic, underline, color } = this.props.workspace;
    let transformation = { style: { bold, italic, underline }, color };
    this.socket.emitMetric('visual mode submit');
    this.socket.emitBulkEditNotes(this.getSelectedNotes(), transformation);
    this.cancel();
  };

  bulkColor = (color) => () => {
    this.props.workspaceActions.colorAll(color);
  };

  toggleBold = () => {
    this.props.workspaceActions.toggleBold();
  };

  toggleItalic = () => {
    this.props.workspaceActions.toggleItalic();
  };

  toggleUnderline = () => {
    this.props.workspaceActions.toggleUnderline();
  };

  render() {
    if (!this.props.show) return null;

    const { bold, italic, underline } = this.props.workspace;

    return (
      <Draggable>
        <div id="ic-visual-toolbar">
          <div>
            <button id="ic-bulk-submit" onClick={this.submit}>
              <i className={'material-icons'}>check</i>
            </button>
            <button className="ic-bulk-edit underline"
                    style={underline ? SELECTED : null}
                    onClick={this.toggleUnderline}>
              <u>U</u>
            </button>
            <button className="ic-bulk-edit italic"
                    style={italic ? SELECTED : null}
                    onClick={this.toggleItalic}>
              <i>I</i>
            </button>
            <button className="ic-bulk-edit bold"
                    style={bold ? SELECTED : null}
                    onClick={this.toggleBold}>
              <b>B</b>
            </button>
            <FormPalette setColor={this.bulkColor} />
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
    uiActions: bindActionCreators(uiActions, dispatch),
    workspaceActions: bindActionCreators(workspaceActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VisualModeToolbar);
