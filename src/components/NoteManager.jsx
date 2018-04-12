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
    this.toast = new Toast();

    this.socket = new Socket();
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
    this.notes = this.chooseDisplayedNotes(nextProps.workspace, nextProps.notes);
  }

  chooseDisplayedNotes(w, notes) {
    if (this.props.visualMode) {
      return _.map(notes, (note, i) => {
        let copy = Object.assign({}, note);
        copy.style = Object.assign({}, note.style);
        if (w.selected[i]) {
          if (!copy.doodle) {
            if (w.bold !== null) copy.style.bold = w.bold;
            if (w.italic !== null) copy.style.italic = w.italic;
            if (w.underline !== null) copy.style.underline = w.underline;
          }
          if (w.color !== null) copy.color = w.color;
        }

        return copy;
      });
    } else if (this.props.draftMode) {
      return w.drafts.concat(notes);
    } else {
      return notes;
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

    if (this.props.draftMode && !note.draft) return this.toast.warn(PROMPTS.DRAFT_MODE_NO_CHANGE);
    if (note.draft) this.props.workspaceX.dragDraft(i, x, y);
    else if (this.socket.emitDragNote(note)) {
      this.props.noteX.drag(i, x, y);
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

  renderNote = (note, i) => {
    return (
      <StickyNote key={`note${i}`}
                  note={note}
                  i={i}
                  submitDraft={this.submitDraft}
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
    workspace: state.workspace,
    ui: state.ui,
    color: state.users.nameToColor[state.users.me],
    visualMode: state.ui.editingMode === EDITING_MODE.VISUAL || false,
    draftMode: state.ui.editingMode === EDITING_MODE.DRAFT || false,
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
