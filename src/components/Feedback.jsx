'use strict';

import React, { Component } from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';

export default class Feedback extends Component {

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <div id="ic-feedback" style={this.props.style}>
                <button className="ic-close-window" onClick={this.props.close}>x</button>
                <div id="ic-feedback-contents">
                    <h1>Hi there, Hieu here!</h1>
                    <p>If you would like to report a bug or request a feature, go <Link to="https://github.com/thecardkid/innovators-compass/issues" target="_blank" rel="noopener noreferrer">here</Link> and click <em>New issue</em>.</p>
                    <p>If you are reporting a bug, please list the steps to reproduce it.</p>
                    <p>If requesting a feature, please be detailed.</p>
                    <p>If you are a developer, feel free to open a Pull Request.</p>
                </div>
            </div>
        );
    }
}

Feedback.propTypes = {
    close: PropTypes.func.isRequired,
    style: PropTypes.object.isRequired
};

