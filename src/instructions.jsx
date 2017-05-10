'use strict';

import React, { Component } from 'react'
import _ from 'underscore';

const instructions = [
    'Share your code to collaborate',
    'Each user has a different sticky note color',
    'Familiarize yourself with the CONTROLS in the menu',
    'Click a sticky note to edit it',
    'If keys stop working, hit Esc a few times'
];

class Instructions extends Component {
    getListItem(item, i) {
        return (
            <li key={'instr'+i}>
                {(i+1) + '. ' + item}
            </li>
        );
    }

    render() {
        return (
            <div style={this.props.style} id="instructions">
                <div id="contents">
                    <h1>Help page</h1>
                    <ul>
                        {_.map(instructions, this.getListItem)}
                    </ul>
                </div>
                <button onClick={this.props.close}>Got it!</button>
            </div>
        );
    }
}

export default Instructions;
