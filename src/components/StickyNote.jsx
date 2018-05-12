import deepEqual from 'deep-equal';
import linkifyHtml from 'linkifyjs/html';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Tappable from 'react-tappable/lib/Tappable';
import { bindActionCreators } from 'redux';

import Modal from '../utils/Modal';
import Toast from '../utils/Toast';

import * as uiX from '../actions/ui';
import * as workspaceX from '../actions/workspace';

import { PROMPTS, COLORS, EDITING_MODE, MODALS } from '../../lib/constants';

class StickyNote extends Component {
  constructor(props) {
    super(props);
    this.toast = Toast.getInstance();
    this.modal = Modal.getInstance();
    this.hasEditingRights = !this.props.viewOnly;
    this.setModes(this.props);
  }

  shouldComponentUpdate(nextProps) {
    return (
      !deepEqual(this.props.note, nextProps.note) ||
      this.props.ui.vw !== nextProps.ui.vw ||
      this.props.ui.vh !== nextProps.ui.vh ||
      this.props.i !== nextProps.i ||
      this.props.ui.focusedNote !== nextProps.ui.focusedNote ||
      this.props.ui.editingMode === EDITING_MODE.VISUAL ||
      this.props.ui.editingMode !== nextProps.ui.editingMode
    );
  }

  componentWillUpdate(nextProps) {
    this.setModes(nextProps);
  }

  setModes(props) {
    this.compactMode = props.ui.editingMode === EDITING_MODE.COMPACT || false;
    this.visualMode = props.ui.editingMode === EDITING_MODE.VISUAL || false;
  }

  confirmDelete = (ev) => {
    ev.stopPropagation();

    if (this.visualMode) return this.toast.warn(PROMPTS.VISUAL_MODE_NO_CHANGE);

    let n = this.props.note;
    if (n.draft) {
      this.modal.confirm(MODALS.DISCARD_DRAFT, (discard) => {
        if (discard) this.props.workspaceX.undraft(this.props.i);
      });
    } else {
      this.modal.confirm(MODALS.DELETE_NOTE, (deleteNote) => {
        if (deleteNote) this.props.destroy(n._id);
      });
    }
  };

  submitDraft = () => {
    if (this.visualMode) {
      return this.toast.warn('Cannot submit drafts in bulk edit mode');
    }
    this.props.submitDraft(this.props.note, this.props.i);
  };

  upvote = (ev) => {
    ev.stopPropagation();
    this.props.socket.emitWorkspace('+1 note', this.props.note._id);
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
      background: n.color,
      padding: n.isImage ? '3px' : '0',
    };
    const clazz = this.compactMode ? 'compact ic-img contents' : 'ic-img contents';

    return (
      <div className={clazz} style={s}>
        <img src={n.doodle || n.text}
             alt={n.altText || ''}
             width={this.compactMode ? '100px' : '160px'}/>
        {this.getTooltip(n)}
      </div>
    );
  };

  renderText = (n) => {
    let style = { background: n.color };
    let clazz = 'text';
    if (n.style.bold) clazz += ' bold';
    if (n.style.italic) clazz += ' italic';
    if (n.style.underline) clazz += ' underline';
    const divClazz = this.compactMode ? 'compact contents' : 'contents';

    return (
      <div style={style} className={divClazz}>
        <p className={clazz} dangerouslySetInnerHTML={{ __html: linkifyHtml(n.text) }} />
        {this.getTooltip(n)}
      </div>
    );
  };

  getContents = () => {
    let n = this.props.note;
    if (n.doodle || n.isImage) return this.renderDoodle(n);
    else return this.renderText(n);
  };

  getX = () => {
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
      return this.toast.warn(PROMPTS.CANNOT_EDIT_DOODLE);
    }

    if (this.visualMode) {
      return this.toast.warn(PROMPTS.VISUAL_MODE_NO_CHANGE);
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
    if (ev.target.parentElement &&
      ev.target.parentElement.parentElement) {
      if (ev.target.parentElement.parentElement.doneDrag) {
        ev.target.parentElement.parentElement.dragging = false;
        ev.target.parentElement.parentElement.doneDrag = false;
        return;
      }

      if (ev.target.parentElement.parentElement.dragging) {
        return;
      }
    }

    if (!this.visualMode && ev.shiftKey) {
      if (this.props.note.draft) {
        return this.toast.warn('Cannot enter bulk mode by selecting a draft');
      }

      this.props.enterVisualMode(this.props.i);
    }

    if (this.visualMode) {
      if (this.props.note.draft) {
        return this.toast.warn('Cannot select drafts in bulk edit mode');
      }

      this.props.socket.emitMetric('visual mode select');
      this.props.workspaceX.selectNote(this.props.i);
    } else {
      this.props.uiX.focusOnNote(this.props.i);
    }
  };

  onTouchStart = (ev) => {
    ev.persist();
    this.longPress = setTimeout(() => this.edit(ev), 1000);
  };

  onTouchRelease = () => {
    clearTimeout(this.longPress);
  };

  render() {
    let n = this.props.note,
      i = this.props.i,
      style = {
        left: n.x * this.props.ui.vw,
        top: n.y * this.props.ui.vh,
        // from src/css/zIndex.less
        zIndex: i === this.props.ui.focusedNote ? 3 : 2,
      };

    let sel = this.props.workspace.selected;
    if (sel && sel[i]) {
      style.left -= 3;
      style.top -= 3;
      style.border = `3px solid ${COLORS.BLUE}`;
    }

    return (
      <div className={`ic-sticky-note draggable ${n.draft ? 'draft' : ''}`}
           style={style}
           onClick={this.clickNote}
           onDoubleClick={this.edit}
           onTouchStart={this.onTouchStart}
           onTouchEnd={this.onTouchRelease}
           id={`note${i}`}
           height={n.doodle ? '100px' : null}>
        {this.getX()}
        {this.getContents()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    compass: state.compass,
    ui: state.ui,
    workspace: state.workspace,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    workspaceX: bindActionCreators(workspaceX, dispatch),
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StickyNote);
