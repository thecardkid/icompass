import deepEqual from 'deep-equal';
import linkifyHtml from 'linkifyjs/html';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Tappable from 'react-tappable/lib/Tappable';
import { bindActionCreators } from 'redux';

import Modal from '../utils/Modal';
import Toast from '../utils/Toast';

import * as uiActions from '../actions/ui';
import * as workspaceActions from '../actions/workspace';

import { PROMPTS, COLORS, EDITING_MODE, MODALS } from '../../lib/constants';

class StickyNote extends Component {
  constructor(props) {
    super(props);
    this.toast = Toast.getInstance();
    this.modal = Modal.getInstance();
    this.hasEditingRights = !this.props.compass.viewOnly;
    this.setModes(this.props);
    this.lastClick = 0;
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

  confirmDelete = () => {
    if (this.visualMode) return this.toast.warn(PROMPTS.VISUAL_MODE_NO_CHANGE);

    let n = this.props.note;
    if (n.draft) {
      this.modal.confirm(MODALS.DISCARD_DRAFT, (discard) => {
        if (discard) this.props.workspaceActions.undraft(this.props.i);
      });
    } else {
      this.modal.confirm(MODALS.DELETE_NOTE, (deleteNote) => {
        if (deleteNote) this.props.destroy(n._id);
      });
    }
  };

  submitDraft = () => {
    if (this.visualMode) {
      return this.toast.warn('You can\'t submit drafts in bulk edit mode');
    }
    this.props.submitDraft(this.props.note, this.props.i);
  };

  getTooltip(n) {
    if (n.draft) {
      return (
        <button className="ic-tooltip submit" onClick={this.submitDraft} onTouchStart={this.submitDraft}>
          submit
        </button>
      );
    } else {
      return <p className="ic-tooltip">{n.user}</p>;
    }
  }

  renderDoodle = (n) => {
    let s = {
      background: n.color,
      padding: n.isImage ? '3px' : '0',
    };

    return (
      <div className="ic-img contents" style={s}>
        <img src={n.doodle || n.text}
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

    return (
      <div style={style} className={this.compactMode ? 'contents compact' : 'contents'}>
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

  edit = () => {
    if (this.props.note.doodle) {
      return this.toast.warn(PROMPTS.CANNOT_EDIT_DOODLE);
    }

    if (this.visualMode) {
      return this.toast.warn(PROMPTS.VISUAL_MODE_NO_CHANGE);
    }

    if (this.hasEditingRights) {
      if (this.props.note.isImage) {
        this.props.uiActions.editImage(this.props.i, this.props.note);
      } else {
        this.props.uiActions.showEdit(this.props.i, this.props.note);
      }
    }
  };

  handleClick = () => {
    let now = Date.now();
    if (now - this.lastClick < 40) return;

    this.lastClick = now;
    if (this.visualMode) {
      if (this.props.note.draft) {
        return this.toast.warn('Cannot select drafts in bulk edit mode');
      }

      this.props.socket.emitMetric('visual mode select');
      this.props.workspaceActions.selectNote(this.props.i);
    } else {
      this.props.uiActions.focusOnNote(this.props.i);
    }
  };

  render() {
    let n = this.props.note,
      i = this.props.i,
      style = {
        left: n.x * this.props.ui.vw,
        top: n.y * this.props.ui.vh,
        zIndex: i === this.props.ui.focusedNote ? 1 : 0,
      };

    let sel = this.props.workspace.selected;
    if (sel && sel[i]) {
      style.left -= 3;
      style.top -= 3;
      style.border = `3px solid ${COLORS.BLUE}`;
    }

    return (
      <div className="ic-sticky-note draggable"
           style={style}
           onClick={this.handleClick}
           onDoubleClick={this.edit}
           id={`note${i}`}
           height={n.doodle ? '100px' : null}>
        {this.getX()}
        <Tappable onTap={this.handleClick} onPress={this.edit}>
          {this.getContents()}
        </Tappable>
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
    workspaceActions: bindActionCreators(workspaceActions, dispatch),
    uiActions: bindActionCreators(uiActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StickyNote);
