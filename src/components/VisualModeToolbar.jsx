import React, { Component } from 'react';
import Draggable from 'react-draggable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import Modal from '../utils/Modal';

import * as uiActions from '../actions/ui';
import * as workspaceActions from '../actions/workspace';

import { COLORS, STICKY_COLORS, MODALS } from '../../lib/constants';
import Socket from '../utils/Socket';

const SELECTED = {
  background: COLORS.DARK,
  color: 'white',
  border: '2px solid white',
};
const SELECTED_COLOR_BORDER = '2px solid orangered';

class VisualModeToolbar extends Component {
  constructor(props) {
    super(props);
    this.modal = new Modal();
    this.socket = new Socket();
  }

  getSelectedNotes = () => {
    const selected = [];
    _.each(this.props.notes, (n, i) => {
      if (this.props.workspace.selected[i]) selected.push(n._id);
    });
    return selected;
  };

  bulkDelete = () => {
    this.modal.confirm(MODALS.BULK_DELETE_NOTES, (deleteNotes) => {
      if (deleteNotes) {
        this.socket.emitBulkDeleteNotes(this.getSelectedNotes());
        this.cancel();
      }
    });
  };

  cancel = () => {
    this.props.uiActions.normalMode();
  };

  submit = () => {
    let { bold, italic, underline, color } = this.props.workspace;
    let transformation = { style: { bold, italic, underline }, color };
    this.socket.emitBulkEditNotes(this.getSelectedNotes(), transformation);
    this.cancel();
  };

  getPalette = () => {
    let style;
    const { color } = this.props.workspace;
    const { colorAll } = this.props.workspaceActions;
    return _.map(STICKY_COLORS, (c, i) => {
      style = { background: c };
      if (c === color) style['border'] = SELECTED_COLOR_BORDER;
      return (
        <button onClick={() => colorAll(c)}
                key={'color' + i}
                id={c.substring(1)}
                className="ic-visual-color"
                style={style} />
      );
    });
  };

  render() {
    if (!this.props.show) return null;

    const { bold, italic, underline } = this.props.workspace;
    const { toggleBold, toggleItalic, toggleUnderline } = this.props.workspaceActions;

    return (
      <Draggable>
        <div id="ic-visual-toolbar">
          <div id="ic-visual-hint">Click on stickies to select them</div>
          <hr/>
          <div className="ic-visual-group">
            <button className="ic-bulk-edit bold"
                    style={bold ? SELECTED : null}
                    onClick={toggleBold}>
              <b>B</b>
            </button>
            <button className="ic-bulk-edit italic"
                    style={italic ? SELECTED : null}
                    onClick={toggleItalic}>
              <i>I</i>
            </button>
            <button className="ic-bulk-edit underline"
                    style={underline ? SELECTED : null}
                    onClick={toggleUnderline}>
              <u>U</u>
            </button>
          </div>
          <hr/>
          <div className="ic-visual-group">
            {this.getPalette()}
          </div>
          <hr/>
          <div className="ic-visual-group ic-visual-actions">
            <button id="ic-bulk-delete" onClick={this.bulkDelete}>
              delete all
            </button>
            <button id="ic-bulk-cancel" onClick={this.cancel}>
              never mind
            </button>
            <button id="ic-bulk-submit" onClick={this.submit}>
              ship it
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
