import React, { Component } from 'react'

class StickyNote extends Component {

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

    render() {
        let n = this.props.note;
        let style = {
            left: n.x * this.props.w,
            top: n.y * this.props.h
        };

        return (
            <li style={style}
                className="ic-sticky-note"
                draggable="true"
                onClick={() => this.props.edit(n)}
                id={n._id}
                onDragEnd={(e) => this.props.moveNote(e, n)}>
                <a style={{background: n.color}}>
                    <p>{n.text}</p>
                </a>
            </li>
        );
    }
}

export default StickyNote;
