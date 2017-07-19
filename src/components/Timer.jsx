'use strict';

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as workspaceActions from 'Actions/workspace';
import * as uiActions from 'Actions/ui';

class Timer extends Component {
    constructor(props) {
        super(props);

        this.granularity = 1000;
        this.running = false;
        this.state = {
            left: null,
            flash: false,
        };

        this.tick = this.tick.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.workspace.timer !== this.props.workspace.timer ||
            nextState.left !== this.state.left ||
            nextState.flash !== this.state.flash;
    }

    componentDidUpdate() {
        let timer;
        if (!this.running && (timer = this.props.workspace.timer)) {
            this.start(timer.min, timer.sec);
        }
    }

    start(min, sec) {
        if (this.running) return;

        this.duration = min * 60 + sec;
        this.startTime = Date.now();
        this.running = true;
        this.tick();
    }

    handleClick() {
        if (this.running) return; // TODO pause
        if (this.state.flash) return this.setState({flash: false});
        this.props.uiActions.showTimerConfig();
    }

    tick() {
        let left = this.duration - (((Date.now() - this.startTime) / 1000) | 0),
            flash = false;

        if (left > 0) {
            setTimeout(this.tick, this.granularity);
        } else {
            left = 0;
            flash = true;
            this.running = false;
            this.props.workspaceActions.setTimer(null);
        }

        this.setState({ left, flash });
    }

    parse(seconds) {
        return {
            min: (seconds / 60) | 0,
            sec: (seconds % 60) | 0,
        };
    }

    render() {
        let contents, style = {};
        if (this.running) {
            let time = this.parse(this.state.left);
            contents = time.min + ':' + time.sec;
        } else {
            contents = 'timebox';
        }

        if (this.state.flash) style = {background: 'palevioletred'};

        return (
            <button name="timer" className="ic-action" onClick={this.handleClick} style={style}>
                <i className="material-icons">timer</i>
                <p>{contents}</p>
            </button>
        );
    }
}

function mapStateToProps(state) {
    return {
        workspace: state.workspace
    };
}

function mapDispatchToProps(dispatch) {
    return {
        workspaceActions: bindActionCreators(workspaceActions, dispatch),
        uiActions: bindActionCreators(uiActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Timer);
