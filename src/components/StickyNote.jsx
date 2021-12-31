import $ from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Tappable from 'react-tappable/lib/Tappable';
import { bindActionCreators } from 'redux';

import { messages } from './utils/Toast';
import * as uiX from '@actions/ui';
import * as workspaceX from '@actions/workspace';
import { CSS, EDITING_MODES } from '@utils/constants';

import { contextMenu } from '@cypress/data_cy';

class StickyNote extends Component {
  constructor(props) {
    super(props);
    this.hasEditingRights = !this.props.viewOnly;
  }

  confirmDelete = (ev) => {
    ev.stopPropagation();

    if (this.props.isMultiEditMode) {
      this.props.uiX.toastError('Delete failed. ' + messages.multiEditNoSingleEdit);
      return;
    }

    let n = this.props.note;
    if (n.draft) {
      this.props.uiX.openDeleteDraftModal();
      this.props.uiX.setModalExtras({ deleteDraftIndex: this.props.i });
    } else {
      this.props.uiX.openDeleteNoteModal();
      this.props.uiX.setModalExtras({ deleteNoteID: this.props.note._id });
    }
  };

  submitDraft = () => {
    if (this.props.isMultiEditMode) {
      return this.props.uiX.toastError('Cannot submit drafts in multi-edit mode');
    }
    this.props.submitDraft(this.props.note, this.props.i);
    this.props.uiX.tutorialGoToStep(6);
  };

  upvote = (ev) => {
    ev.stopPropagation();
    if (this.props.isMultiEditMode) {
      return this.props.uiX.toastError('Upvote failed. ' + messages.multiEditNoSingleEdit);
    }

    if (!this.props.note.draft) {
      this.props.socket.emitUpvoteNote(this.props.note._id);
    }
  };

  getTooltip(n) {
    if (n.draft) {
      return (
        <button className="ic-tooltip submit" onClick={this.submitDraft} onTouchStart={this.submitDraft}>
          publish
        </button>
      );
    } else {
      let upvoteButtonClass = 'ic-upvote';
      if (!n.upvotes) {
        upvoteButtonClass += ' on-hover-only';
      }

      return (
        <div>
          <p className="ic-tooltip">{n.user}</p>
          {this.hasEditingRights && <p className={upvoteButtonClass} onClick={this.upvote}>+{n.upvotes || 1}</p>}
        </div>
      );
    }
  }

  renderDoodle = (n) => {
    let s = {
      background: n.color || 'chartreuse',
      padding: n.isImage ? '3px' : '0',
    };
    return (
      <div className={'ic-img contents'} style={s}>
        <img src={n.doodle || n.text}
             alt={n.altText || ''}
             width={160}/>
        {this.getTooltip(n)}
      </div>
    );
  };

  renderText = (n) => {
    return (
      <div style={{ background: n.color || 'chartreuse' }} className={'contents'}>
        <p className={'text'} ref={'text'} dangerouslySetInnerHTML={{__html: n.text}}/>
        {this.getTooltip(n)}
      </div>
    );
  };

  renderContents = () => {
    let n = this.props.note;
    if (n.doodle || n.isImage) return this.renderDoodle(n);
    else return this.renderText(n);
  };

  renderCloseButton = () => {
    // TODO refactor this to use MaybeTappable. It will mess with the
    // DOM hierarchy so could potentially break tests the rely on parent > child
    // selectors. Currently, hitting "X" does call this.confirmDelete twice
    if (this.hasEditingRights) {
      return (
        <button className="ic-close-window" onClick={this.confirmDelete}>
          <Tappable onTap={this.confirmDelete}>x</Tappable>
        </button>
      );
    }
  };

  edit = (ev) => {
    if (ev.target.className === 'ic-upvote') return;

    if (this.props.note.doodle) {
      return this.props.uiX.toastError('Sketches cannot be edited.');
    }

    if (this.props.isMultiEditMode) {
      return this.props.uiX.toastError('Double-click failed. ' + messages.multiEditNoSingleEdit);
    }

    if (this.hasEditingRights) {
      if (this.props.note.isImage) {
        this.props.uiX.editImage(this.props.i, this.props.note);
      } else {
        this.props.uiX.showEdit(this.props.i, this.props.note);
      }
    }
  };

  clickNote = (ev) => {
    let $el = ev.target;

    while ($el.parentElement != null && !$el.id.startsWith('note')) {
      $el = $el.parentElement;
    }

    if ($el.doneDrag) {
      $el.dragging = false;
      $el.doneDrag = false;
      return;
    }

    if ($el.dragging) {
      return;
    }

    if (!this.props.isMultiEditMode && ev.shiftKey) {
      this.selectAndEnterVisual();
    }

    if (this.props.isMultiEditMode) {
      this.selectInVisual();
    } else {
      this.focus();
    }
  };

  selectAndEnterVisual = () => {
    if (this.props.note.draft) {
      this.props.uiX.toastError(messages.multiEditNoDrafts);
    } else {
      this.props.enterVisualMode(this.props.i);
    }
  };

  selectInVisual = () => {
    if (this.props.note.draft) {
      this.props.uiX.toastError(messages.multiEditNoDrafts);
    } else {
      this.props.workspaceX.selectNote(this.props.i);
    }
  };

  focus = () => {
    this.props.uiX.focusOnNote(this.props.i);
  };

  onTouchStart = (ev) => {
    // Detect if dragging - this is jank, and is duplicated in
    // this.clickNote
    let $el = ev.target;
    while ($el.parentElement != null && !$el.id.startsWith('note')) {
      $el = $el.parentElement;
    }
    if ($el.dragging) {
      return;
    }
    // Long press simulation. Canceled in this.onTouchRelease
    ev.persist();
    this.longPress = setTimeout(() => this.edit(ev), 1000);
  };

  onTouchRelease = () => {
    clearTimeout(this.longPress);
  };

  showContextMenu = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    if (this.props.isMultiEditMode || !this.hasEditingRights) {
      return;
    }
    let left = ev.clientX;
    let top = ev.clientY;
    let $parent = ev.target.parentElement;
    while (!$parent.className.includes('draggable')) {
      $parent = $parent.parentElement;
    }
    if ($parent.style.transform || $parent.style.webkitTransform) {
      left -= this.props.note.x * this.props.ui.vw;
      top -= this.props.note.y * this.props.ui.vh;
    }
    this.focus();
    this.props.workspaceX.showNoteContextMenu({ left, top }, this.props.i);
    $(window).on('mousedown', this.hideContextMenuIfNotAction);
  };

  hideContextMenuIfNotAction = (ev) => {
    if (!ev.target.className.includes('ic-menu-item')) {
      this.hideContextMenu();
    }
  };

  hideContextMenu = () => {
    this.props.workspaceX.hideNoteContextMenu();
    $(window).off('mousedown', this.hideContextMenuIfNotAction);
  };

  executeThenHide = (fn) => (ev) => {
    ev.stopPropagation();
    ev.persist();
    fn(ev);
    this.hideContextMenu();
  };

  showImage = () => {
    if (this.props.note.isImage) {
      this.props.uiX.openImageModal();
      this.props.uiX.setModalExtras({ src: this.props.note.text });
    } else if (this.props.note.doodle) {
      this.props.uiX.openImageModal();
      this.props.uiX.setModalExtras({
        src: this.props.note.doodle,
        background: this.props.note.color || 'chartreuse',
      });
    }
  };

  textToSpeech = () => {
    const { note } = this.props;

    if (note.doodle) {
      return;
    }

    let msg;
    let type;
    const { x, y } = note;

    if (x < 0.5) {
      type = y < 0.5 ? 'Principle' : 'Observation';
    } else {
      type = y < 0.5 ? 'Idea' : 'Experiment';
    }

    if (note.isImage) {
      msg = note.altText || 'Alternative text not available for this image';
    } else {
      msg = this.refs.text.textContent;
    }

    window.speechSynthesis.speak(new SpeechSynthesisUtterance(type));
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`by ${note.user}`));

    if (note.upvotes) {
      const times = note.upvotes === 1 ? 'time' : 'times';
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(`upvoted ${note.upvotes} ${times}`));
    }
  };

  renderContextMenu = () => {
    const { note } = this.props;
    const disableIfDraft = note.draft ? 'disabled' : '';
    const disableIfText = (note.isImage || note.doodle) ? '' : 'disabled';
    const disableIfDoodle = note.doodle ? 'disabled' : '';
    const disableIfBulk = this.props.isMultiEditMode ? 'disabled' : '';

    return (
      <div className={'ic-menu context-menu'} style={this.props.workspace.noteContextMenu.style}>
        <section className={'border-bottom'}>
          <div data-cy={contextMenu.editAction} className={`ic-menu-item ${disableIfDoodle} ${disableIfBulk}`}
               onClick={this.executeThenHide(this.edit)}>
            <i className={'material-icons'}>edit</i>
            Edit
          </div>
          <div data-cy={contextMenu.upvoteAction} className={`ic-menu-item ${disableIfDraft} ${disableIfBulk}`}
               onClick={this.executeThenHide(this.upvote)}>
            <i className={'material-icons'}>exposure_plus_1</i>
            Upvote
          </div>
        </section>
        <section className={'border-bottom'}>
          <div data-cy={contextMenu.textToSpeechAction} className={`ic-menu-item ${disableIfDoodle}`}
               onClick={this.executeThenHide(this.textToSpeech)}>
            <i className={'material-icons'}>volume_up</i>
            Text to Speech
          </div>
          <div data-cy={contextMenu.zoomAction} className={`ic-menu-item ${disableIfText}`}
               onClick={this.executeThenHide(this.showImage)}>
            <i className={'material-icons'}>crop_free</i>
            View {note.doodle ? 'Sketch' : 'Image'}
          </div>
          <div data-cy={contextMenu.bringToFrontAction} className={'ic-menu-item'}
               onClick={this.executeThenHide(this.focus)}>
            <i className={'material-icons'}>flip_to_front</i>
            Bring to Front
          </div>
          <div data-cy={contextMenu.selectAction} className={`ic-menu-item ${disableIfDraft}`}
               onClick={this.executeThenHide(
                 this.props.isMultiEditMode ? this.selectInVisual : this.selectAndEnterVisual
               )}>
            <i className={'material-icons'}>photo_size_select_small</i>
            Select
          </div>
        </section>
        <section>
          <div data-cy={contextMenu.discardAction} className={`ic-menu-item dangerous ${disableIfBulk}`}
               onClick={this.executeThenHide(this.confirmDelete)}>
            <i className={'material-icons'}>delete</i>
            {note.draft ? 'Discard' : 'Delete'}
          </div>
        </section>
      </div>
    );
  };

  render() {
    let n = this.props.note,
      i = this.props.i,
      style = {
        left: n.x * this.props.ui.vw,
        top: n.y * this.props.ui.vh,
        // from src/css/z-indices.less
        zIndex: i === this.props.ui.focusedNote ? 3 : 2,
      };

    let sel = this.props.workspace.selected;
    if (sel && sel[i]) {
      style.left -= 3;
      style.top -= 3;
      style.border = `3px solid ${CSS.COLORS.BLUE}`;
    }

    let showContextMenu = false;
    if (this.props.workspace.noteContextMenu
      && this.props.workspace.noteContextMenu.noteIdx === this.props.i) {
      showContextMenu = true;
    }

    return (
      <div className={`ic-sticky-note draggable ${n.draft ? 'draft' : ''}`}
           style={style}
           onClick={this.clickNote}
           onDoubleClick={this.edit}
           onTouchStart={this.onTouchStart}
           onTouchEnd={this.onTouchRelease}
           onContextMenu={this.showContextMenu}
           id={`note${i}`}
           height={n.doodle ? '100px' : null}>
        {this.renderCloseButton()}
        {this.renderContents()}
        {showContextMenu && this.renderContextMenu()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    compass: state.compass,
    ui: state.ui,
    workspace: state.workspace,

    isMultiEditMode: state.ui.editingMode === EDITING_MODES.VISUAL,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    workspaceX: bindActionCreators(workspaceX, dispatch),
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StickyNote);
