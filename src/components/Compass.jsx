'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';

import * as uiActions from 'Actions/ui';

import StickyNote from 'Components/StickyNote.jsx';

import { QUADRANTS_INFO } from 'Lib/constants';

class Compass extends Component {
    constructor(props) {
        super(props);
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
                mode={this.props.compass.mode}
                focusOn={this.props.uiActions.focusOnNote}
                compact={this.props.ui.compact}
            />
        );
    }

    renderQuadrant(q) {
        return (
            <div key={q.id} className="ic-quadrant" id={q.id}>
                <h1>{q.id.toUpperCase()}</h1>
                <h2>{q.prompt}</h2>
            </div>
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
                <div id="center" style={this.center(100,100)}>
                    <p style={{marginTop: top}}>{center}</p>
                </div>
                <div id="hline" style={{top: this.props.ui.vh/2 - 2}}></div>
                <div id="vline" style={{left: this.props.ui.vw/2 - 2}}></div>
                {_.map(QUADRANTS_INFO, this.renderQuadrant)}
            </div>
        );
    }

    render() {
        return (
            <div id="compass">
                {this.renderCompassStructure()}
                {_.map(this.props.notes, this.renderNote.bind(this))}
                <button className="ic-corner-btn"
                    id="ic-compact"
                    onClick={this.props.uiActions.toggleCompactMode}>
                    Compact
                </button>
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

