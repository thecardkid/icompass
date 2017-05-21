'use strict';

import React, { Component } from 'react';
import SocketIOClient from 'socket.io-client';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import _ from 'underscore';

import Shared from './Shared.jsx';

import { QUADRANTS_INFO } from '../utils/constants.js';

export default class CompassView extends Component {

    constructor(props, context) {
        super(props, context);

        this.socket = SocketIOClient();
        this.socket.emit('find compass view', {
            code: this.props.params.code,
            username: this.props.params.username
        });
        this.browserHistory = browserHistory;

        this.state = {
            vw: window.innerWidth,
            vh: window.innerHeight,
        };
        this.socket.on('compass found', Shared.handleCompassFound.bind(this));

        // Shared methods
        this.renderNote = Shared.renderNote.bind(this);
        this.center = Shared.center.bind(this);
        this.renderQuadrant = Shared.renderQuadrant;
        this.getCompassStructure = Shared.getCompassStructure.bind(this);
    }

    componentDidMount() {
        $(window).on('resize', this.updateWindowSize.bind(this));
    }

    updateWindowSize() {
        this.setState({vw: window.innerWidth, vh: window.innerHeight});
    }

    render() {
        if (!this.state.compass) return <div id="compass"></div>;

        let stickies = _.map(this.state.compass.notes, this.renderNote);
        let quadrants = _.map(QUADRANTS_INFO, Shared.renderQuadrant);
        let structure = this.getCompassStructure(this.state.compass.center);

        return (
            <div id="compass">
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

