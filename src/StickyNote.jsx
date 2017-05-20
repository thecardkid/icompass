import React, { Component } from 'react'
import { PROMPTS } from '../utils/constants.js';

export default class StickyNote extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        let thisNote = this.props.note,
            nextNote = nextProps.note;

        return (
            thisNote.x !== nextNote.x ||
            thisNote.y !== nextNote.y ||
            thisNote.text !== nextNote.text ||
            thisNote.isImage !== nextNote.isImage ||
            this.props.w !== nextProps.w ||
            this.props.h !== nextProps.h
        );
    }

    confirmDelete(e) {
        e.stopPropagation();
        if (confirm(PROMPTS.CONFIRM_DELETE_NOTE))
            this.props.destroy(this.props.note._id);
    }

    render() {
        let n = this.props.note;
        let style = {
            left: n.x * this.props.w,
            top: n.y * this.props.h
        };

        let contents;
        if (n.doodle || n.isImage) {
            let s = {
                background: n.color,
                padding: n.isImage ? '3px' : '0',
            };
            contents = (
                <a className="ic-img" style={s}>
                    <img src={n.doodle || n.text} width="164px"/>
                </a>
            )
        } else {
            contents = (
                <a style={{background: n.color}}>
                    <p>{n.text}</p>
                </a>
            );
        }

        return (
            <li style={style}
                className="ic-sticky-note draggable"
                onClick={() => this.props.edit(n)}
                id={'note'+this.props.i}
                height={n.doodle ? '100px' : ''}>
                    <button className='ic-close-window' onClick={this.confirmDelete.bind(this)}>x</button>
                    {contents}
            </li>
        );
    }
}

