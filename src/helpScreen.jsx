'use strict';

import React, { Component } from 'react'
import _ from 'underscore';
import { HELP_TIPS } from '../utils/constants.js';

export default class HelpScreen extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

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
                        {_.map(HELP_TIPS, this.getListItem)}
                    </ul>
                </div>
                <button className="ic-button" onClick={this.props.close}>Got it!</button>
            </div>
        );
    }
}

