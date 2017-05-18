import React, { Component } from 'react'

export default class StickyNote extends Component {

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

        let contents;
        if (n.doodle) {
            let s = {
                background: n.color, padding: 0
            };
            contents = (
                <a style={s}>
                    <img src={n.doodle} width="164px"/>
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
                // draggable="true"
                onClick={() => this.props.edit(n)}
                id={'note'+this.props.i}
                height={n.doodle ? '100px' : ''}>
                    {contents}
            </li>
        );
    }
}

