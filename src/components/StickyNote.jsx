import $ from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Tappable from 'react-tappable/lib/Tappable';
import { bindActionCreators } from 'redux';

import Modal from '../utils/Modal';
import Toast from '../utils/Toast';

import * as uiX from '../actions/ui';
import * as workspaceX from '../actions/workspace';

import { COLORS, EDITING_MODE } from '../../lib/constants';

const VISUAL_MODE_NO_CHANGE = 'You can\'t make changes to individual notes while in BULK EDIT mode';

class StickyNote extends Component {
  constructor(props) {
    super(props);
    this.state = { contextMenu: null };

    this.toast = Toast.getInstance();
    this.modal = Modal.getInstance();
    this.hasEditingRights = !this.props.viewOnly;
    this.setModes(this.props);
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

    if (this.visualMode) return this.toast.warn(VISUAL_MODE_NO_CHANGE);

    let n = this.props.note;
    if (n.draft) {
      this.modal.confirm({
        body: 'You are about to discard this draft. This action cannot be undone.',
        confirmText: 'Discard',
        cb: (confirmed) => {
          if (confirmed) {
            this.props.workspaceX.undraft(this.props.i);
          }
        },
      });
    } else {
      this.modal.confirm({
        body: 'You are about to delete this note. This action cannot be undone.',
        confirmText: 'Delete',
        cb: (confirmed) => {
          if (confirmed) {
            this.props.destroy(n._id);
          }
        },
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
    const divClazz = this.compactMode ? 'compact contents' : 'contents';

    return (
      <div style={{ background: n.color }} className={divClazz}>
        <p className={'text'} dangerouslySetInnerHTML={{__html: n.text}}/>
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
      return this.toast.warn('Sketches cannot be edited.');
    }

    if (this.visualMode) {
      return this.toast.warn(VISUAL_MODE_NO_CHANGE);
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

    if (!this.visualMode && ev.shiftKey) {
      this.selectAndEnterVisual();
    }

    if (this.visualMode) {
      this.selectInVisual();
    } else {
      this.focus();
    }
  };

  selectAndEnterVisual = () => {
    if (this.props.note.draft) {
      this.toast.warn('Cannot enter bulk edit mode by selecting a draft');
    } else {
      this.props.enterVisualMode(this.props.i);
    }
  };

  selectInVisual = () => {
    if (this.props.note.draft) {
      this.toast.warn('Cannot select drafts in bulk edit mode');
    } else {
      this.props.workspaceX.selectNote(this.props.i);
    }
  };

  focus = () => {
    this.props.uiX.focusOnNote(this.props.i);
  };

  onTouchStart = (ev) => {
    ev.persist();
    this.longPress = setTimeout(() => this.edit(ev), 1000);
  };

  onTouchRelease = () => {
    clearTimeout(this.longPress);
  };

  showContextMenu = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();

    const contextMenu = {
      top: ev.clientY,
      left: ev.clientX,
    };

    let $parent = ev.target.parentElement;
    while (!$parent.className.includes('draggable')) {
      $parent = $parent.parentElement;
    }

    if ($parent.style.transform || $parent.style.webkitTransform) {
      contextMenu.top -= this.props.note.y * this.props.ui.vh;
      contextMenu.left -= this.props.note.x * this.props.ui.vw;
    }

    this.setState({ contextMenu });
    $(window).on('mousedown', this.hideContextMenuIfNotAction);
  };

  hideContextMenuIfNotAction = (ev) => {
    if (!ev.target.className.includes('ic-menu-item')) {
      this.hideContextMenu();
    }
  };

  hideContextMenu = () => {
    this.setState({ contextMenu: null });
    $(window).off('mousedown', this.hideContextMenu);
  };

  executeThenHide = (fn) => (ev) => {
    ev.stopPropagation();

    ev.persist();
    fn(ev);
    this.hideContextMenu();
  };

  renderContextMenu = () => {
    const { draft } = this.props.note;
    return (
      <div className={'ic-menu context-menu'} style={this.state.contextMenu}>
        <section className={'border-bottom'}>
          <div className={'ic-menu-item'}
               onClick={this.executeThenHide(this.edit)}>
            Edit
          </div>
          <div className={'ic-menu-item'}
               onClick={this.executeThenHide(this.upvote)}>
            Upvote
          </div>
        </section>
        <section className={'border-bottom'}>
          <div className={'ic-menu-item'}
               onClick={this.executeThenHide(this.focus)}>
            Bring to Front
          </div>
          <div className={`ic-menu-item ${draft ? 'disabled' : ''}`}
               onClick={this.executeThenHide(
                 this.visualMode ? this.selectInVisual : this.selectAndEnterVisual
               )}>
            Select
          </div>
        </section>
        <section>
          <div className={'ic-menu-item dangerous'}
               onClick={this.executeThenHide(this.confirmDelete)}>
            {draft ? 'Discard' : 'Delete'}
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
           onContextMenu={this.showContextMenu}
           id={`note${i}`}
           height={n.doodle ? '100px' : null}>
        {this.getX()}
        {this.getContents()}
        {this.state.contextMenu && this.renderContextMenu()}
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
