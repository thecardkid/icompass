'use strict';

import React, { Component } from 'react';
import Tappable from 'react-tappable/lib/Tappable';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';

import * as uiActions from 'Actions/ui';

import StickyNote from 'Components/StickyNote.jsx';

import { QUADRANTS_INFO, EDITING_MODE } from 'Lib/constants';

class Compass extends Component {
    constructor(props) {
        super(props);

        this.renderNote = this.renderNote.bind(this);
        this.renderQuadrant = this.renderQuadrant.bind(this);
        this.noteWithPosition = this.noteWithPosition.bind(this);
    }

    renderNote(note, i) {
        return (
            <StickyNote key={note._id}
                note={note}
                focusedNote={this.props.ui.focusedNote}
                i={i}
                w={this.props.ui.vw}
                h={this.props.ui.vh}
                edit={this.props.uiActions.showEdit}
                destroy={this.props.destroy}
                viewOnly={this.props.compass.viewOnly}
                focusOn={this.props.uiActions.focusOnNote}
                compact={this.props.ui.editingMode === EDITING_MODE.COMPACT}
            />
        );
    }

    noteWithPosition(e) {
        this.props.uiActions.showNewNote(e);
    }

    renderQuadrant(q) {
        return (
            <Tappable onPress={this.noteWithPosition} key={q.id}>
                <div onDoubleClick={this.noteWithPosition} className="ic-quadrant" id={q.id}>
                    <div>
                        <h1>{q.id.toUpperCase()}</h1>
                        <h2>{q.prompt}</h2>
                    </div>
                </div>
            </Tappable>
        );
    }

    center(w, h) {
        return {
            top: Math.max((this.props.ui.vh - h) / 2, 0),
            left: Math.max((this.props.ui.vw - w) / 2, 0)
        };
    }

    renderCompassStructure() {
        let center = this.props.compass.center;
        let lines = Math.ceil(center.length / 11),
            textHeight = 13 * lines,
            top = (100 - textHeight) / 2;

        return (
            <div>
                <div id="center" className="wordwrap" style={this.center(100,100)}>
                    <p style={{marginTop: top}}>{center}</p>
                </div>
                <div id="hline" style={{top: this.props.ui.vh/2 - 2}}></div>
                <div id="vline" style={{left: this.props.ui.vw/2 - 2}}></div>
                {_.map(QUADRANTS_INFO, this.renderQuadrant.bind(this))}
            </div>
        );
    }

    render() {
        return (
            <div id="compass">
                {this.renderCompassStructure()}
                {_.map(this.props.notes, this.renderNote.bind(this))}
            </div>
        );
    }
}

Compass.propTypes = {
    ui: PropTypes.object.isRequired,
    compass: PropTypes.object.isRequired,
    notes: PropTypes.array.isRequired,
    uiActions: PropTypes.objectOf(PropTypes.func).isRequired,
    destroy: PropTypes.func
};

function mapStateToProps(state) {
    return {
        compass: state.compass,
        notes: state.notes,
        ui: state.ui
    };
}

function mapDispatchToProps(dispatch) {
    return {
        uiActions: bindActionCreators(uiActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Compass);

