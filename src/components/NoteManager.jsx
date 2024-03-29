import interact from 'interactjs';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import StickyNote from './StickyNote.jsx';
import { DeleteDraftModal, DeleteNoteModal, DeleteNotesModal } from './modals/ConfirmDelete';
import ImageModal from './modals/ImageModal';
import { messages } from './utils/Toast';

import * as noteX from '@actions/notes';
import * as uiX from '@actions/ui';
import * as workspaceX from '@actions/workspace';
import { trackFeatureEvent } from '@utils/analytics';
import { EDITING_MODES } from '@utils/constants';
import Socket from '@utils/Socket';
import Storage from '@utils/Storage';
import events from '@socket_events';

class NoteManager extends Component {
  constructor(props) {
    super(props);
    this.notes = [];

    this.socket = Socket.getInstance();
    this.socket.subscribe({
      [events.frontend.UPDATE_ALL_NOTES]: this.onUpdateNotes,
      [events.frontend.CLEAR_NOTE_PROGRESS]: this.clearNoteProgress,
      [events.frontend.DELETED_NOTE]: this.onDeleteNotes,
    });

    interact('.draggable').draggable({
      restrict: {
        restriction: 'parent',
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
      },
      autoScroll: true,
      onstart: this.dragStart,
      onmove: this.dragTarget,
      onend: this.dragEnd,
    });
  }

  clearNoteProgress = ({ key }) => {
    Storage.saveNoteProgress(key, null);
  };

  onUpdateNotes = (notes) => {
    this.props.noteX.updateAll(notes);

    if (this.props.visualMode) {
      this.props.workspaceX.updateSelected(notes.length);
    }

    _.each(notes, (note, idx) => {
      this.setTranslation(document.getElementById(`note${idx}`), 0, 0);
    });
  };

  onDeleteNotes = (deletedIdx) => {
    if (this.props.visualMode) {
      this.props.workspaceX.removeNotesIfSelected(deletedIdx);
    }
  };

  componentWillUpdate(nextProps) {
    this.notes = this.chooseDisplayedNotes(nextProps);
  }

  chooseDisplayedNotes({ workspace, notes, visualMode }) {
    if (visualMode) {
      // Don't remember why it's notes + drafts here, but drafts + note
      // in the else case.
      // But here, notes come first so that workspace.selected indexing
      // is easy.
      return notes.concat(workspace.drafts);
    } else {
      return workspace.drafts.concat(notes);
    }
  }

  setTranslation(target, x, y) {
    const leftPx = target.style.left;
    const topPx = target.style.top;
    const left = parseFloat(leftPx.substring(0, leftPx.length - 2));
    const top = parseFloat(topPx.substring(0, topPx.length - 2));

    const xMax = this.props.ui.vw - left - 20;
    const xMin = -left;
    const yMax = this.props.ui.vh - top - 20;
    const yMin = -top;

    x = Math.min(xMax, Math.max(xMin, x));
    y = Math.min(yMax, Math.max(yMin, y));

    target.style.webkitTransform =
      target.style.transform = `translate(${x}px, ${y}px)`;
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

  dragStart = (e) => {
    // TODO pinching with one finger on a note shows edit form.
    // But I also don't really care about this problem. Can fix at later date.
    e.target.dragging = true;
  };

  dragAll = (noteId, { dx, dy }) => {
    _.each(noteId, id => {
      const $note = document.getElementById(id);
      let x = (parseFloat($note.getAttribute('data-x')) || 0) + dx;
      let y = (parseFloat($note.getAttribute('data-y')) || 0) + dy;
      this.setTranslation($note, x, y);
    });
  };

  getSelectedIds = () => {
    const selectedIds = {
      htmlIds: [],
      mongoIds: [],
    };
    _.each(this.props.notes, (n, i) => {
      if (this.props.workspace.selected[i]) {
        selectedIds.htmlIds.push(`note${i}`);
        selectedIds.mongoIds.push(n._id);
      }
    });
    return selectedIds;
  };

  dragTarget = (e) => {
    if (this.props.visualMode) {
      const noteIndex = e.target.id.substring(4);
      if (!this.props.workspace.selected[noteIndex]) return;

      this.dragAll(this.getSelectedIds().htmlIds, e);
      return;
    }

    this.dragAll([e.target.id], e);
  };

  bulkDrag = (ids, { dx, dy }) => {
    dx /= this.props.ui.vw;
    dy /= this.props.ui.vh;
    this.socket.emitBulkDragNotes(ids, dx, dy);
  };

  dragEnd = (e) => {
    e.target.doneDrag = true;
    if (this.props.visualMode) {
      const noteIndex = e.target.id.substring(4);
      if (!this.props.workspace.selected[noteIndex]) return;

      this.bulkDrag(this.getSelectedIds().mongoIds, e);
      return;
    }

    this.setTranslation(e.target, 0, 0);

    let i = Number(e.target.id.substring(4));
    let x = this.notes[i].x + e.dx / this.props.ui.vw,
      y = this.notes[i].y + e.dy / this.props.ui.vh;
    let note = Object.assign({}, this.notes[i], { x, y });

    // This is an easy hack to avoid this bug where, on mobile, a note would
    // zap to the top-left corner when the user is trying to drag it.
    if (x < 0.0001 && y < 0.0001) {
      return;
    }
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
    this.props.workspaceX.deleteDraft(idx);
    delete note.draft;
    delete note._id;
    note.color = Storage.getStickyNoteColor();
    // Can't submit draft in visual mode, no need to check
    this.socket.emitNewNote(note);
    trackFeatureEvent('Submit draft');
  };

  enterVisualMode = (idx) => {
    if (this.props.ui.device.isMobile) {
      this.props.uiX.toastError(messages.mobileNoMultiEdit);
      return;
    }
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
                  enterVisualMode={this.enterVisualMode}/>
    );
  };

  deleteNote = () => {
    if (this.props.ui.editingMode === EDITING_MODES.VISUAL) {
      return;
    }
    this.socket.emitDeleteNote(this.props.ui.modalExtras.deleteNoteID);
  };

  deleteSelectedNotes = () => {
    const selected = [];
    _.each(this.props.notes, (n, i) => {
      if (this.props.workspace.selected[i]) {
        selected.push(n._id);
      }
    });
    this.socket.emitBulkDeleteNotes(selected);
    this.props.uiX.normalMode();
  };

  deleteDraft = () => {
    this.props.workspaceX.deleteDraft(this.props.ui.modalExtras.deleteDraftIndex);
  };

  render() {
    return (
      <div id="note-manager">
        {_.map(this.notes, this.renderNote)}
        <DeleteDraftModal onConfirm={this.deleteDraft} />
        <DeleteNoteModal onConfirm={this.deleteNote} />
        <DeleteNotesModal onConfirm={this.deleteSelectedNotes} />
        <ImageModal />
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
    visualMode: state.ui.editingMode === EDITING_MODES.VISUAL || false,
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
