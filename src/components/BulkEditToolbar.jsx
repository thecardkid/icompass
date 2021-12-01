import * as classnames from 'classnames';
import React, { Component } from 'react';
import Draggable from 'react-draggable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

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
    boldApplied: false,
    italicApplied: false,
    underlineApplied: false,
    strikethroughApplied: false,
  };

  getSelectedNotes = () => {
    return this.props.notes.filter((n, i) => this.props.workspace.selected[i]);
  };

  getSelectedNoteIDs = () => {
    return this.getSelectedNotes().map(x => x._id);
  }

  bulkDelete = (ev) => {
    ev.stopPropagation();
    this.props.uiX.openDeleteNotesModal();
  };

  bulkColor = (color) => {
    this.socket.emitBulkEditNotes(this.getSelectedNoteIDs(), { color });
    this.setState({ color });
    trackFeatureEvent('Bulk edit: Color');
  };

  alignLeft = () => {
    const minLeft = Math.min(...this.getSelectedNotes().map(n => n.x));
    this.socket.emitBulkEditNotes(this.getSelectedNoteIDs(), { alignLeft: minLeft });
  };

  alignTop = () => {
    const minTop = Math.min(...this.getSelectedNotes().map(n => n.y));
    this.socket.emitBulkEditNotes(this.getSelectedNoteIDs(), { alignTop: minTop });
  };

  bulkToggleFormatting(isApplied, prefix, suffix) {
    const x = {};
    this.getSelectedNotes().forEach(n => {
      if (n.isImage || n.doodle) {
        return;
      }
      if (isApplied) {
        x[n._id] = n.text.replaceAll(prefix, '',).replaceAll(suffix, '');
      } else {
        x[n._id] = prefix + n.text + suffix;
      }
    });
    this.socket.emitBulkEditNotes(this.getSelectedNoteIDs(), { texts: x });
  }

  toggleBold = () => {
    this.bulkToggleFormatting(this.state.boldApplied, '<strong>', '</strong>');
    this.setState({ boldApplied: !this.state.boldApplied });
  };

  toggleItalic = () => {
    this.bulkToggleFormatting(this.state.italicApplied, '<em>', '</em>');
    this.setState({ italicApplied: !this.state.italicApplied });
  };

  toggleUnderline = () => {
    this.bulkToggleFormatting(this.state.underlineApplied, '<u>', '</u>');
    this.setState({ underlineApplied: !this.state.underlineApplied });
  };

  toggleStrikethrough = () => {
    this.bulkToggleFormatting(this.state.strikethroughApplied, '<s>', '</s>');
    this.setState({ strikethroughApplied: !this.state.strikethroughApplied });
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
            <h1>Multi-Edit Toolbar</h1>
            <i onClick={this.props.uiX.normalMode} className={'material-icons toolbar-close'}>close</i>
          </div>
          {warning}
          <div id={'explanation'}>
            {this.getSelectedNotes().length === 0 && (
                <div>Select notes by holding Shift and clicking on individual notes. Alternatively, hold left click and drag across the workspace.</div>
            )}
            <div>Dragging one note will move all selected notes. Or choose an action below.</div>
          </div>
          <div id={'actions'}>
            <hr />
            <div className={'action update-color'}>
              <span className={'label'}>Color</span>
              <FormPalette setColor={this.bulkColor} color={this.state.color}/>
            </div>
            <div className={'action align'}>
              <span className={'label'}>Alignment</span>
              <button className={'left'} onClick={this.alignLeft}>Left</button>
              <button className={'top'} onClick={this.alignTop}>Top</button>
            </div>
            <div className={'action formatting'}>
              <span className={'label'}>Formatting</span>
              <i className={classnames('material-icons bold', { applied: this.state.boldApplied })}
                 onClick={this.toggleBold}>format_bold</i>
              <i className={classnames('material-icons italic', { applied: this.state.italicApplied })}
                 onClick={this.toggleItalic}>format_italic</i>
              <i className={classnames('material-icons underline', { applied: this.state.underlineApplied })}
                 onClick={this.toggleUnderline}>format_underline</i>
              <i className={classnames('material-icons strikethrough', { applied: this.state.strikethroughApplied })}
                 onClick={this.toggleStrikethrough}>strikethrough_s</i>
            </div>
            <hr />
            <div className={'footer'}>
              <button className={'bulk-edit-btn delete'} onClick={this.bulkDelete}>
                Delete
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
