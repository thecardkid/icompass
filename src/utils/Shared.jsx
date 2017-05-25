import React from 'react';

import StickyNote from 'Components/StickyNote.jsx';
import _ from 'underscore';

import { QUADRANTS_INFO } from 'Lib/constants.js';

export default {
    renderNote(note, i) {
        return (
            <StickyNote key={note._id}
                note={note}
                focusedNote={this.props.ui.focusedNote}
                i={i}
                w={this.state.vw}
                h={this.state.vh}
                edit={this.props.uiActions.showEdit}
                destroy={this.socket.emitDeleteNote}
                mode={this.props.compass.mode}
                focusOn={this.props.uiActions.focusOnNote}
                compact={this.props.ui.compact}
            />
        );
    },

    center(w, h) {
        return {
            top: Math.max((this.state.vh - h) / 2, 0),
            left: Math.max((this.state.vw - w) / 2, 0)
        };
    },

    renderQuadrant(q) {
        return (
            <div key={q.id} className="ic-quadrant" id={q.id}>
                <h1>{q.id.toUpperCase()}</h1>
                <h2>{q.prompt}</h2>
            </div>
        );
    },

    getCompassStructure(text) {
        if (!text) return null;

        let lines = Math.ceil(text.length / 11),
            textHeight = 13 * lines,
            top = (100 - textHeight) / 2;

        return (
            <div>
                <div id="center" style={this.center(100,100)}>
                    <p style={{marginTop: top}}>{text}</p>
                </div>
                {_.map(QUADRANTS_INFO, this.renderQuadrant)}
                <div id="hline" style={{top: this.state.vh/2 - 2}}></div>
                <div id="vline" style={{left: this.state.vw/2 - 2}}></div>
            </div>
        );
    }
};

