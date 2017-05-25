'use strict';

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'underscore';

import * as uiActions from '../actions/ui';
import * as noteActions from '../actions/notes';
import * as compassActions from '../actions/compass';

import Socket from 'Utils/Socket.jsx';
import Shared from 'Utils/Shared.jsx';

class CompassView extends Component {
    constructor(props, context) {
        super(props, context);

        this.socket = new Socket(this);
        this.socket.emitFindCompassView();

        // Shared methods
        this.renderNote = Shared.renderNote.bind(this);
        this.center = Shared.center.bind(this);
        this.renderQuadrant = Shared.renderQuadrant;
        this.getCompassStructure = Shared.getCompassStructure.bind(this);

        this.props.uiActions.setScreenSize(window.innerWidth, window.innerHeight);
    }

    componentDidMount() {
        $(window).on('resize', this.props.uiActions.resize);
    }

    componentWillUnmount() {
        $(window).on('resize', this.props.uiActions.resize);
    }

    render() {
        if (!this.props.compass) return <div id="compass"></div>;

        let stickies = _.map(this.props.notes, this.renderNote);
        let structure = this.getCompassStructure(this.props.compass.center);

        return (
            <div id="compass">
                <button className="ic-corner-btn" id="ic-compact" onClick={this.props.uiActions.toggleCompactMode}>Compact</button>
                {stickies}
                {structure}
            </div>
        );
    }
}

CompassView.propTypes = {
    params: PropTypes.object.isRequired,
    notes: PropTypes.array.isRequired,
    compass: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
    uiActions: PropTypes.objectOf(PropTypes.fn).isRequired
};

function mapStateToProps(state) {
    return {
        notes: state.notes,
        compass: state.compass,
        ui: state.ui
    };
}

function mapDispatchToProps(dispatch) {
    return {
        noteActions: bindActionCreators(noteActions, dispatch),
        compassActions: bindActionCreators(compassActions, dispatch),
        uiActions: bindActionCreators(uiActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompassView);

