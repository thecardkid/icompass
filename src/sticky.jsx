import React, { Component } from 'react'

class StickyNote extends Component {
    constructor(props, context) {
        super(props, context);

        this.apiMoveNote = this.apiMoveNote.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        let thisNote = this.props.note,
            nextNote = nextProps.note;

        return (
            thisNote.x !== nextNote.x ||
            thisNote.y !== nextNote.y ||
            thisNote.text !== nextNote.text ||
            this.props.w !== nextProps.w ||
            this.props.h !== nextProps.h
        );
    }

    apiMoveNote(event, id) {
        let h = $('#'+id).height();
        this.props.socket.emit('move note', {
            noteId: id,
            x: event.clientX / this.props.w,
            y: (event.clientY - h) / this.props.h
        });
    }

    render() {
        let n = this.props.note;
        let style = {
            left: n.x * this.props.w,
            top: n.y * this.props.h
        };

        return (
            <li style={style}
                draggable="true"
                onClick={() => this.props.edit(this.props.note)}
                id={n._id}
                onDragEnd={(e) => this.apiMoveNote(e, n._id)}>
                <a style={{background: n.color}}>
                    <p>{n.text}</p>
                </a>
            </li>
        );
    }
}

export default StickyNote;
