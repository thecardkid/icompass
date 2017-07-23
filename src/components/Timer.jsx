'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';

import * as workspaceActions from 'Actions/workspace';
import * as uiActions from 'Actions/ui';

const GREY = 'rgb(221, 221, 221)',
    RED = 'rgb(219, 112, 147)';

class Timer extends Component {
    constructor(props) {
        super(props);

        this.granularity = 1000;
        this.running = false;
        this.interval = null;
        this.state = {left: null};

        this.tick = this.tick.bind(this);
        this.stop = this.stop.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.timer !== this.props.timer ||
            nextState.left !== this.state.left;
    }

    componentDidUpdate() {
        let empty = _.isEmpty(this.props.timer);
        if (this.running && empty) {
            this.running = false;
            this.setState({left: null});
            return;
        }

        if (!this.running && !empty) {
            this.start(this.props.timer);
        }
    }

    start(t) {
        if (this.running) return;
        if (this.interval) this.removeInterval();

        this.duration = t.min * 60 + t.sec;
        this.startTime = t.startTime;
        this.running = true;
        this.tick();
    }

    removeInterval() {
        clearInterval(this.interval);
        this.interval = null;
        $('button[name=timer]').css('background', '');
    }

    handleClick() {
        if (this.running) return;
        if (this.interval) return this.removeInterval();
        this.props.uiActions.showTimerConfig();
    }

    tick() {
        let left = this.duration - (((Date.now() - this.startTime) / 1000) | 0);

        if (left > 0) {
            setTimeout(this.tick, this.granularity);
        } else {
            left = 0;
            this.flash();
            this.running = false;
            this.props.workspaceActions.setTimer({});
            this.props.uiActions.setSidebarVisible(true);
        }

        this.setState({ left });
    }

    flash() {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(this.toggleBackground, 600);
    }

    toggleBackground() {
        let btn = $('button[name=timer]');
        if (btn.css('background').includes(GREY)) {
            btn.css('background', RED);
        } else {
            btn.css('background', GREY);
        }
    }

    parse(seconds) {
        let min = (seconds / 60) | 0;
        if (min < 10) min = '0' + min;
        let sec = (seconds % 60) | 0;
        if (sec < 10) sec = '0' + sec;
        return { min, sec };
    }

    stop(e) {
        e.stopPropagation();
        this.props.stop();
    }

    render() {
        let contents;
        if (this.running) {
            let time = this.parse(this.state.left);
            contents = (
                <div>
                    <p className="ic-time">{time.min}:{time.sec}</p>
                    <div className="ic-timer-action dangerous" onClick={this.stop}>
                        <p>stop</p>
                    </div>
                </div>
            );
        } else {
            contents = <p>timebox</p>;
        }

        return (
            <button name="timer" className="ic-action" onClick={this.handleClick}>
                <i className="material-icons">timer</i>
                {contents}
            </button>
        );
    }
}

Timer.propTypes = {
    timer: PropTypes.objectOf(PropTypes.number).isRequired,
    stop: PropTypes.func.isRequired,
    workspaceActions: PropTypes.objectOf(PropTypes.func).isRequired,
    uiActions: PropTypes.objectOf(PropTypes.func).isRequired,
};

function mapStateToProps(state) {
    return {
        timer: state.workspace.timer || {}
    };
}

function mapDispatchToProps(dispatch) {
    return {
        workspaceActions: bindActionCreators(workspaceActions, dispatch),
        uiActions: bindActionCreators(uiActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Timer);
