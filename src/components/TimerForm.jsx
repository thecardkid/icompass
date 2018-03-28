import $ from 'jquery';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Toast from '../utils/Toast';

import { PROMPTS } from '../../lib/constants';

class TimerForm extends Component {
    constructor(props) {
        super(props);
        this.toast = new Toast();

        this.submit = this.submit.bind(this);
        this.retrieveValuesAndSubmit = this.retrieveValuesAndSubmit.bind(this);
    }

    submit(m, s) {
        if (m === 0 && s === 0) return;
        if (m === 30 && s > 0) return this.toast.error(PROMPTS.TIMEBOX_TOO_LONG);
        if (m > 30) return this.toast.error(PROMPTS.TIMEBOX_TOO_LONG);
        if (m < 0 || s < 0) return this.toast.error(PROMPTS.TIMEBOX_NEGATIVE_VALUES);
        if (s > 59) return this.toast.error(PROMPTS.TIMEBOX_TOO_MANY_SECONDS);
        this.props.ship(m, s);
        this.props.close();
    }

    retrieveValuesAndSubmit() {
        let m = Number($('#ic-timer-min').val()),
            s = Number($('#ic-timer-sec').val());
        this.submit(m, s);
    }

    render() {
        return (
            <div className="ic-modal" id="ic-timer-form" style={this.props.style}>
                <div className="ic-modal-contents">
                    <div className="ic-modal-header">
                        <h1 className="ic-modal-title">Create a timebox</h1>
                        <div id="ic-quick-timers">
                            <button onClick={() => this.submit(0,30)} name="ic-30s">30s</button>
                            <button onClick={() => this.submit(1,0)} name="ic-1m">1m</button>
                            <button onClick={() => this.submit(3,0)} name="ic-3m">3m</button>
                        </div>
                    </div>
                    <div id="ic-timer-config">
                        <input type="number" id="ic-timer-min" min="0" max="99" defaultValue="0"/>
                        <h2>m</h2>
                        <input type="number" id="ic-timer-sec" min="0" max="59" defaultValue="0"/>
                        <h2>s</h2>
                    </div>
                    <button name="nvm" className="ic-button" onClick={this.props.close}>never mind</button>
                    <button name="ship" className="ic-button" onClick={this.retrieveValuesAndSubmit}>ship it</button>
                </div>
            </div>
        );
    }
}

TimerForm.propTypes = {
    close: PropTypes.func.isRequired,
    ship: PropTypes.func.isRequired,
    style: PropTypes.object.isRequired,
};

export default TimerForm;
