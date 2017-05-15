'use strict';

import React, { Component } from 'react'
import _ from 'underscore';

import StickyNote from './StickyNote.jsx';
import Shared from './Shared.jsx';

import { quadrantsInfo } from '../utils/constants.js'

class CompassView extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            vw: window.innerWidth,
            vh: window.innerHeight,
            compass: this.props.compass,
        };

        // Shared methods
        this.renderNote = Shared.renderNote.bind(this);
        this.center = Shared.center.bind(this);
        this.showSavePrompt = Shared.showSavePrompt.bind(this);
        this.exportCompass = Shared.exportCompass.bind(this);
    }

    componentDidMount() {
        alert('IMPORTANT\n\nYou are in view-only mode. You can\'t make or see changes. To see an updated version of the compass, you\'ll have to log back in.');
    }

    render() {
        let stickies = _.map(this.state.compass.notes, this.renderNote);
        let quadrants = _.map(quadrantsInfo, Shared.renderQuadrant);

        return (
            <div id="compass">
                {stickies}
                {quadrants}
                <div id="center" style={this.center(100,100)}>
                    {this.state.compass.center}
                    <button id="export" onClick={this.showSavePrompt}>Save as PDF</button>
                </div>
                <div id="hline" style={{top: this.state.vh/2 - 2}}></div>
                <div id="vline" style={{left: this.state.vw/2 - 2}}></div>
            </div>
        );
    }
}

export default CompassView;
