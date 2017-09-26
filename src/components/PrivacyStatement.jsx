'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Feedback extends Component {

    shouldComponentUpdate(nextProps) {
        return this.props.show !== nextProps.show;
    }

    render() {
        if (!this.props.show) return null;

        return (
            <div id="ic-backdrop"><div id="ic-privacy-statement" className="ic-smallform" style={this.props.style}>
                <button className="ic-close-window" onClick={this.props.close}>x</button>
                <div id="ic-privacy-contents" className="ic-smallform-contents">
                    <h1>Privacy Statement</h1>
                    <p>iCompass will not distribute your code, data, or any personal information included in your compass with any third party.</p>
                    <p>
                        Anyone in possession of your compass&apos; edit code with will be able to modify, add,
                        or delete any and all data in your compass. It is in your interest to keep this code secret,
                        and share it carefully.
                    </p>
                </div>
            </div></div>
        );
    }
}

Feedback.propTypes = {
    close: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    style: PropTypes.object.isRequired
};

