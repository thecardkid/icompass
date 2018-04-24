import interact from 'interactjs';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import StickyNote from './StickyNote.jsx';

import * as noteX from '../actions/notes';
import * as uiX from '../actions/ui';
import * as workspaceX from '../actions/workspace';
import Socket from '../utils/Socket';
import Toast from '../utils/Toast';
import { EDITING_MODE, DRAGGABLE_RESTRICTIONS, PROMPTS } from '../../lib/constants';

class NoteManager extends Component {
  constructor(props) {
    super(props);
    this.notes = [];
    this.toast = Toast.getInstance();

    this.socket = Socket.getInstance();
    this.socket.subscribe({
      'update notes': this.onUpdateNotes,
      'deleted notes': this.onDeleteNotes,
    });

    interact('.draggable').draggable({
      restrict: DRAGGABLE_RESTRICTIONS,
      autoScroll: true,
      onmove: this.dragTarget,
      onend: this.dragEnd,
    });
  }

  onUpdateNotes = (notes) => {
    this.props.noteX.updateAll(notes);

    if (this.props.visualMode)
      this.props.workspaceX.updateSelected(notes.length);
  };

  onDeleteNotes = (deletedIdx) => {
    if (this.props.visualMode)
      this.props.workspaceX.removeNotesIfSelected(deletedIdx);
  };

  componentWillUpdate(nextProps) {
    this.notes = this.chooseDisplayedNotes(nextProps);
  }

  chooseDisplayedNotes({ workspace, notes, visualMode }) {
    if (visualMode) {
      const visualNotes = _.map(notes, (note, i) => {
        let copy = Object.assign({}, note);
        copy.style = Object.assign({}, note.style);
        if (workspace.selected[i]) {
          if (!copy.doodle) {
            if (workspace.bold !== null) copy.style.bold = workspace.bold;
            if (workspace.italic !== null) copy.style.italic = workspace.italic;
            if (workspace.underline !== null) copy.style.underline = workspace.underline;
          }
          if (workspace.color !== null) copy.color = workspace.color;
        }

        return copy;
      });
      return visualNotes.concat(workspace.drafts);
    } else {
      return workspace.drafts.concat(notes);
    }
  }

  setTranslation(target, x, y) {
    target.style.webkitTransform =
      target.style.transform = `translate(${x}px, ${y}px)`;
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

  dragTarget = (e) => {
    if (!this.props.visualMode) {
      let x = (parseFloat(e.target.getAttribute('data-x')) || 0) + e.dx;
      let y = (parseFloat(e.target.getAttribute('data-y')) || 0) + e.dy;
      this.setTranslation(e.target, x, y);
    }
  };

  dragEnd = (e) => {
    if (this.props.visualMode) return this.toast.warn(PROMPTS.VISUAL_MODE_NO_CHANGE);

    this.setTranslation(e.target, 0, 0);

    let i = Number(e.target.id.substring(4));
    let x = this.notes[i].x + e.dx / this.props.ui.vw,
      y = this.notes[i].y + e.dy / this.props.ui.vh;
    let note = Object.assign({}, this.notes[i], { x, y });

    if (note.draft) {
      return this.props.workspaceX.dragDraft(i, x, y);
    } else {
      i -= this.props.drafts.length;
      if (this.socket.emitDragNote(note)) {
        this.props.noteX.drag(i, x, y);
      }
    }
  };

  submitDraft = (note, idx) => {
    this.props.workspaceX.undraft(idx);
    delete note.draft;
    note.color = this.props.color;
    /* Can't submit draft in visual mode, no need to check */
    this.socket.emitNewNote(note);
    this.socket.emitMetric('draft submit');
  };

  enterVisualMode = (idx) => {
    this.props.uiX.visualMode(this.props.notes.length);
    this.props.workspaceX.selectNote(idx - this.props.drafts.length);
  };

  renderNote = (note, i) => {
    return (
      <StickyNote key={`note${i}`}
                  note={note}
                  i={i}
                  submitDraft={this.submitDraft}
                  socket={this.socket}
                  enterVisualMode={this.enterVisualMode}
                  // Can't delete note in visual mode, no need to check
                  destroy={this.socket.emitDeleteNote} />
    );
  };

  render() {
    return (
      <div>
        <div id="note-manager">
          {_.map(this.notes, this.renderNote)}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    notes: state.notes,
    drafts: state.workspace.drafts,
    workspace: state.workspace,
    ui: state.ui,
    color: state.users.nameToColor[state.users.me],
    visualMode: state.ui.editingMode === EDITING_MODE.VISUAL || false,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    noteX: bindActionCreators(noteX, dispatch),
    uiX: bindActionCreators(uiX, dispatch),
    workspaceX: bindActionCreators(workspaceX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NoteManager);
