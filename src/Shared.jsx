import React from 'react';

import StickyNote from './StickyNote.jsx';

import { PROMPTS } from '../utils/constants.js';

export default {
    renderNote(note, i) {
        return (
            <StickyNote key={note._id}
                note={note}
                i={i}
                w={this.state.vw}
                h={this.state.vh}
                edit={this.showEditForm}
                moveNote={this.apiMoveNote}
            />
        );
    },

    center(w, h) {
        return {
            top: (this.state.vh - h) / 2,
            left: (this.state.vw - w) / 2
        };
    },

    showSavePrompt() {
        if (confirm(PROMPTS.EXPORT)) this.exportCompass();
    },

    exportCompass() {
        this.setState({showSidebar: false, showChat: false}, () => {
            window.html2canvas(document.body).then((canvas) => {
                let imgData = canvas.toDataURL('image/png');
                let doc = new jsPDF('l', 'cm', 'a4');
                doc.addImage(imgData, 'PNG', 0, 0, 30, 18);
                doc.save(this.state.compass.center + '-compass.pdf');
            });
        });
    },

    renderQuadrant(q, i) {
        return (
            <div key={q.id} className="ic-quadrant" id={q.id}>
                <h1>{q.id.toUpperCase()}</h1>
                <h2>{q.prompt}</h2>
            </div>
        );
    },

    getCompassStructure(text) {
        return (
            <div>
                <div id="center" style={this.center(100,100)}>
                    {text}
                    <button id="export" onClick={this.showSavePrompt}>Save as PDF</button>
                </div>
                <div id="hline" style={{top: this.state.vh/2 - 2}}></div>
                <div id="vline" style={{left: this.state.vw/2 - 2}}></div>
            </div>
        );
    },
}

