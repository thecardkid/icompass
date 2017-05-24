'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Socket from 'Utils/Socket.jsx';
import Shared from 'Utils/Shared.jsx';

import { QUADRANTS_INFO } from 'Lib/constants.js';

export default class CompassView extends Component {

    constructor(props, context) {
        super(props, context);

        this.socket = new Socket(this);
        this.socket.emitFindCompassView();

        this.state = {
            focusedNote:-1,
            compact:false,
            vw: window.innerWidth,
            vh: window.innerHeight,
        };

        // Shared methods
        this.renderNote = Shared.renderNote.bind(this);
        this.center = Shared.center.bind(this);
        this.renderQuadrant = Shared.renderQuadrant;
        this.getCompassStructure = Shared.getCompassStructure.bind(this);
        this.focusOnNote = this.focusOnNote.bind(this);
        this.toggleCompactMode = this.toggleCompactMode.bind(this);
    }

    componentDidMount() {
        $(window).on('resize', this.updateWindowSize.bind(this));
    }

    updateWindowSize() {
        this.setState({vw: window.innerWidth, vh: window.innerHeight});
    }

    focusOnNote(i) {
        this.setState({focusedNote: i});
    }

    toggleCompactMode() {
        this.setState({compact: !this.state.compact});
    }

    render() {
        if (!this.state.compass) return <div id="compass"></div>;

        let stickies = _.map(this.state.compass.notes, this.renderNote);
        let quadrants = _.map(QUADRANTS_INFO, Shared.renderQuadrant);
        let structure = this.getCompassStructure(this.state.compass.center);

        return (
            <div id="compass">
                <button className="ic-corner-btn" id="ic-compact" onClick={this.toggleCompactMode}>Compact</button>
                {stickies}
                {quadrants}
                {structure}
            </div>
        );
    }
}

CompassView.propTypes = {
    params: PropTypes.object.isRequired
};

