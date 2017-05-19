import React, { Component } from 'react';

import DefaultCompass from '../models/defaultCompass.js';

import CompassEdit from './CompassEdit.jsx';
import LandingPage from './LandingPage.jsx';

export default class Tutorial extends Component {
    constructor(props, context) {
        super(props, context);

        this.compass = DefaultCompass;
        this.compass.center = 'Tutorial';
        this.compass.editCode = '1s5a2nd0';
        this.compass.viewCode = 'd147bo5x';
    }

    render() {
        return (
            <CompassEdit compass={this.compass} username={'sandbox'} />
        );
    }
}

