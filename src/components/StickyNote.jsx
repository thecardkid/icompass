'use strict';

import React, { Component } from 'react';
import Tappable from 'react-tappable/lib/Tappable';
import deepEqual from 'deep-equal';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Modal from '../utils/Modal';
import Toast from '../utils/Toast';

import * as uiActions from '../actions/ui';
import * as workspaceActions from '../actions/workspace';

import { PROMPTS, COLORS, EDITING_MODE, MODALS } from '../../lib/constants';

class StickyNote extends Component {
    constructor(props) {
        super(props);
        this.toast = new Toast();
        this.modal = new Modal();

        this.confirmDelete = this.confirmDelete.bind(this);
        this.getContents = this.getContents.bind(this);
        this.getX = this.getX.bind(this);
        this.edit = this.edit.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.renderDoodle = this.renderDoodle.bind(this);
        this.renderText = this.renderText.bind(this);
        this.submitDraft = this.submitDraft.bind(this);

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
        this.draftMode = props.ui.editingMode === EDITING_MODE.DRAFT || false;
    }

    confirmDelete() {
        if (this.visualMode) return this.toast.warn(PROMPTS.VISUAL_MODE_NO_CHANGE);

        let n = this.props.note;
        if (this.draftMode) {
            if (n.draft) {
                this.modal.confirm(MODALS.DISCARD_DRAFT, (discard) => {
                    if (discard) this.props.workspaceActions.undraft(this.props.i);
                });
            } else this.toast.warn(PROMPTS.DRAFT_MODE_NO_CHANGE);
        } else {
            this.modal.confirm(MODALS.DELETE_NOTE, (deleteNote) => {
                if (deleteNote) this.props.destroy(n._id);
            });
        }
    }

    submitDraft() {
        this.props.submitDraft(this.props.note, this.props.i);
    }

    getTooltip(n) {
        if (n.draft) {
            return (
                <p className="ic-tooltip submit" onClick={this.submitDraft}>
                    <Tappable onTap={this.submitDraft}>submit</Tappable>
                </p>
            );
        } else {
            return <p className="ic-tooltip">{n.user}</p>;
        }
    }

    renderDoodle(n) {
        let s = {
            background: n.color,
            padding: n.isImage ? '3px' : '0',
        };

        return (
            <a className="ic-img" style={s}>
                <img src={n.doodle || n.text}
                    width={this.compactMode ? '100px' : '160px'}/>
                {this.getTooltip(n)}
            </a>
        );
    }

    renderText(n) {
        let style = {background: n.color, letterSpacing: '0px'};
        let textStyle = '';
        if (n.style.bold) textStyle += 'bold ';
        if (n.style.italic) textStyle += 'italic ';
        if (n.style.underline) textStyle += 'underline';

        if (this.compactMode) {
            style.letterSpacing = '-1px';
            style.maxHeight = '70px';
            style.overflow = 'auto';
        }

        return (
            <a style={style}>
                <p className={textStyle}>{n.text}</p>
                {this.getTooltip(n)}
            </a>
        );
    }

    getContents() {
        let n = this.props.note;
        if (n.doodle || n.isImage) return this.renderDoodle(n);
        else return this.renderText(n);
    }

    getX() {
        if (this.hasEditingRights) {
            return <button className="ic-close-window" onClick={this.confirmDelete}>
                <Tappable onTap={this.confirmDelete}>x</Tappable>
            </button>;
        }
    }

    edit() {
        if (this.props.note.doodle) return this.toast.warn(PROMPTS.CANNOT_EDIT_DOODLE);
        if (this.visualMode) return this.toast.warn(PROMPTS.VISUAL_MODE_NO_CHANGE);
        if (this.draftMode && !this.props.note.draft) return this.toast.warn(PROMPTS.DRAFT_MODE_NO_CHANGE);
        if (this.hasEditingRights) this.props.uiActions.showEdit(this.props.i);
    }

    handleClick() {
        let now = Date.now();
        if (now - this.lastClick < 40) return;

        this.lastClick = now;
        if (this.visualMode)
            this.props.workspaceActions.selectNote(this.props.i);
        else
            this.props.uiActions.focusOnNote(this.props.i);
    }

    render() {
        let n = this.props.note,
            i = this.props.i,
            contents = this.getContents(),
            x = this.getX(),
            noteId = `note${i}`,
            height = n.doodle ? '100px' : null,
            style = {
                left: n.x * this.props.ui.vw,
                top: n.y * this.props.ui.vh,
                zIndex: i === this.props.ui.focusedNote ? 1 : 0,
            };

        let sel = this.props.workspace.selected;
        if (sel && sel[i]) {
            style.left -= 3;
            style.top -=3 ;
            style.border = `3px solid ${COLORS.BLUE}`;
        }

        return (
            <div className="ic-sticky-note draggable"
                style={style}
                onClick={this.handleClick}
                onDoubleClick={this.edit}
                id={noteId}
                height={height}>
                {x}
                <Tappable onTap={this.handleClick} onPress={this.edit}>
                    {contents}
                </Tappable>
            </div>
        );
    }
}

StickyNote.propTypes = {
    note: PropTypes.object.isRequired,
    i: PropTypes.number.isRequired,
    destroy: PropTypes.func,
    compass: PropTypes.object.isRequired,
    submitDraft: PropTypes.func,
    ui: PropTypes.object.isRequired,
    workspace: PropTypes.object.isRequired,
    uiActions: PropTypes.objectOf(PropTypes.func).isRequired,
    workspaceActions: PropTypes.objectOf(PropTypes.func).isRequired,
};

function mapStateToProps(state) {
    return {
        compass: state.compass,
        ui: state.ui,
        workspace: state.workspace
    };
}

function mapDispatchToProps(dispatch) {
    return {
        workspaceActions: bindActionCreators(workspaceActions, dispatch),
        uiActions: bindActionCreators(uiActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(StickyNote);

