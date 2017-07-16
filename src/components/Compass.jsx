'use strict';

import React, { Component } from 'react';
import Tappable from 'react-tappable/lib/Tappable';
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

        this.renderNote = this.renderNote.bind(this);
        this.renderQuadrant = this.renderQuadrant.bind(this);
        this.createNoteWithPosition = this.createNoteWithPosition.bind(this);

        this.centerStyle = null;
        this.quadrants = _.map(QUADRANTS_INFO, this.renderQuadrant);
    }

    renderNote(note, i) {
        return (
            <StickyNote key={'note'+i}
                note={note}
                i={i}
                submitDraft={this.props.submitDraft}
                destroy={this.props.destroy}
            />
        );
    }

    createNoteWithPosition(e) {
        this.props.uiActions.showNewNote(e);
    }

    renderQuadrant(q) {
        return (
            <Tappable onPress={this.createNoteWithPosition} key={q.id}>
                <div onDoubleClick={this.createNoteWithPosition} className="ic-quadrant" id={q.id}>
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

    calculateTextHeight(center) {
        let lines = Math.ceil(center.length / 11),
            textHeight = 13 * lines;
        this.centerStyle = {marginTop: (100 - textHeight) / 2};
    }

    renderCompassStructure() {
        let center = this.props.compass.center;
        if (!this.centerStyle) this.calculateTextHeight(center);

        return (
            <div>
                <div id="center" className="wordwrap" style={this.center(100,100)}>
                    <p style={this.centerStyle}>{center}</p>
                </div>
                <div id="hline" style={{top: this.props.ui.vh/2 - 2}} />
                <div id="vline" style={{left: this.props.ui.vw/2 - 2}} />
                {this.quadrants}
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
    destroy: PropTypes.func,
    submitDraft: PropTypes.func,
};

function mapStateToProps(state) {
    return {
        compass: state.compass,
        ui: state.ui
    };
}

function mapDispatchToProps(dispatch) {
    return {
        uiActions: bindActionCreators(uiActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Compass);

