import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { PROMPTS, MODES } from 'Lib/constants.js';

export default class StickyNote extends Component {

    constructor(props, context) {
        super(props, context);

        this.confirmDelete = this.confirmDelete.bind(this);
        this.getContents = this.getContents.bind(this);
        this.getX = this.getX.bind(this);
        this.edit = this.edit.bind(this);
        this.focus = this.focus.bind(this);
        this.hasEditingRights = this.props.mode === MODES.EDIT;
    }

    shouldComponentUpdate(nextProps) {
        let thisNote = this.props.note,
            nextNote = nextProps.note;

        return (
            thisNote.x !== nextNote.x ||
            thisNote.y !== nextNote.y ||
            thisNote.text !== nextNote.text ||
            thisNote.isImage !== nextNote.isImage ||
            this.props.w !== nextProps.w ||
            this.props.h !== nextProps.h ||
            this.props.i !== nextProps.i ||
            this.props.focusedNote !== nextProps.focusedNote ||
            this.props.compact !== nextProps.compact
        );
    }

    confirmDelete(e) {
        e.stopPropagation();
        if (confirm(PROMPTS.CONFIRM_DELETE_NOTE))
            this.props.destroy(this.props.note._id);
    }

    getContents() {
        let n = this.props.note;
        if (n.doodle || n.isImage) {
            let s = {
                background: n.color,
                padding: n.isImage ? '3px' : '0',
            };
            return (
                <a className="ic-img" style={s}>
                    <img onDoubleClick={this.edit} src={n.doodle || n.text} width={this.props.compact ? "100px" : "164px"}/>
                </a>
            );
        } else {
            let style = {background: n.color, letterSpacing: '1px'};

            if (this.props.compact) {
                style.letterSpacing = '0px';
                style.maxHeight = '70px';
                style.overflow = 'auto';
            }

            return (
                <a style={style}>
                    <p>{n.text}</p>
                </a>
            );
        }
    }

    getX() {
        if (this.hasEditingRights)
            return <button className='ic-close-window' onClick={this.confirmDelete}>x</button>;
    }

    edit() {
        if (this.hasEditingRights)
            this.props.edit(this.props.note);
    }

    focus() {
        this.props.focusOn(this.props.i);
    }

    render() {
        let n = this.props.note,
            contents = this.getContents(),
            x = this.getX(),
            noteId = 'note'+this.props.i,
            height = n.doodle ? '100px' : null,
            style = {
                left: n.x * this.props.w,
                top: n.y * this.props.h,
                zIndex: this.props.i === this.props.focusedNote ? 1 : 0,
            };

        return (
            <li style={style}
                className="ic-sticky-note draggable"
                onClick={this.focus}
                onDoubleClick={this.edit}
                id={noteId}
                height={height}>
                {x}
                {contents}
            </li>
        );
    }
}

StickyNote.propTypes = {
    note: PropTypes.object.isRequired,
    i: PropTypes.number.isRequired,
    w: PropTypes.number.isRequired,
    h: PropTypes.number.isRequired,
    edit: PropTypes.func,
    destroy: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    focusedNote: PropTypes.number.isRequired,
    focusOn: PropTypes.func.isRequired,
    compact: PropTypes.bool.isRequired
};

