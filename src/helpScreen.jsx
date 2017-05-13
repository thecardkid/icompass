'use strict';

import React, { Component } from 'react'
import _ from 'underscore';

const tips = [
    'Share your code to collaborate',
    'Each user has a different sticky note color',
    'Familiarize yourself with the CONTROLS in the menu',
    'Click a sticky note to edit it',
    'If keys stop working, hit Esc a few times'
];

class HelpScreen extends Component {
    getListItem(item, i) {
        return (
            <li key={'tip'+i}>
                {(i+1) + '. ' + item}
            </li>
        );
    }

    render() {
        return (
            <div style={this.props.style} className="ic-modal" id="help-screen">
                <div id="contents">
                    <h1>Help page</h1>
                    <ul>
                        {_.map(tips, this.getListItem)}
                    </ul>
                </div>
                <button className="ic-button" onClick={this.props.close}>Got it!</button>
            </div>
        );
    }
}

export default HelpScreen;
