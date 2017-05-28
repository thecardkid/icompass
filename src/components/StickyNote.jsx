'use strict';

import React, { Component } from 'react';
import Tappable from 'react-tappable/lib/Tappable';
import deepEqual from 'deep-equal';
import PropTypes from 'prop-types';

import { PROMPTS, MODES } from 'Lib/constants';

export default class StickyNote extends Component {

    constructor(props, context) {
        super(props, context);

        this.confirmDelete = this.confirmDelete.bind(this);
        this.getContents = this.getContents.bind(this);
        this.getX = this.getX.bind(this);
        this.edit = this.edit.bind(this);
        this.focus = this.focus.bind(this);
        this.renderDoodle = this.renderDoodle.bind(this);
        this.renderText = this.renderText.bind(this);

        this.hasEditingRights = this.props.mode === MODES.EDIT;
    }

    shouldComponentUpdate(nextProps) {
        let thisNote = this.props.note,
            nextNote = nextProps.note;

        return (
            !deepEqual(thisNote, nextNote) ||
            this.props.w !== nextProps.w ||
            this.props.h !== nextProps.h ||
            this.props.i !== nextProps.i ||
            this.props.focusedNote !== nextProps.focusedNote ||
            this.props.compact !== nextProps.compact
        );
    }

    confirmDelete() {
        if (confirm(PROMPTS.CONFIRM_DELETE_NOTE))
            this.props.destroy(this.props.note._id);
    }

    renderDoodle(n) {
        let s = {
            background: n.color,
            padding: n.isImage ? '3px' : '0',
        };
        return (
            <a className="ic-img" style={s}>
                <img onDoubleClick={this.edit}
                    src={n.doodle || n.text}
                    width={this.props.compact ? '100px' : '160px'}/>
                <p className="ic-tooltip">{n.user}</p>
            </a>
        );
    }

    renderText(n) {
        let style = {background: n.color, letterSpacing: '0px'};
        let textStyle = '';
        if (n.style.bold) textStyle += 'bold ';
        if (n.style.italic) textStyle += 'italic ';
        if (n.style.underline) textStyle += 'underline';

        if (this.props.compact) {
            style.letterSpacing = '-1px';
            style.maxHeight = '70px';
            style.overflow = 'auto';
        }

        return (
            <a style={style}>
                <p className={textStyle}>{n.text}</p>
                <p className="ic-tooltip">{n.user}</p>
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
            <div className="ic-sticky-note draggable"
                style={style}
                onClick={this.focus}
                onDoubleClick={this.edit}
                id={noteId}
                height={height}>
                {x}
                <Tappable onTap={this.focus} onPress={this.edit}>
                    {contents}
                </Tappable>
            </div>
        );
    }
}

StickyNote.propTypes = {
    note: PropTypes.object.isRequired,
    i: PropTypes.number.isRequired,
    w: PropTypes.number.isRequired,
    h: PropTypes.number.isRequired,
    edit: PropTypes.func,
    destroy: PropTypes.func,
    mode: PropTypes.string.isRequired,
    focusedNote: PropTypes.number.isRequired,
    focusOn: PropTypes.func.isRequired,
    compact: PropTypes.bool.isRequired
};

