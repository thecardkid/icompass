import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import Toast from '../utils/Toast';

import { PROMPTS } from '../../lib/constants';

import * as workspaceActions from '../actions/workspace';
import * as uiActions from '../actions/ui';

class Timer extends Component {
  constructor(props) {
    super(props);
    this.toast = new Toast();

    this.granularity = 1000;
    this.running = false;
    this.state = { left: null };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.timer !== this.props.timer ||
      nextState.left !== this.state.left;
  }

  componentDidUpdate() {
    let empty = _.isEmpty(this.props.timer);
    if (this.running && empty) {
      this.running = false;
      this.setState({ left: null });
      return;
    }

    if (!this.running && !empty) {
      this.start(this.props.timer);
    }
  }

  start(t) {
    if (this.running) return;

    this.duration = t.min * 60 + t.sec;
    this.startTime = t.startTime;
    this.running = true;
    this.tick();
  }

  handleClick = () => {
    if (this.running) return;
    this.props.uiActions.showTimerConfig();
  };

  tick = () => {
    let left = this.duration - (((Date.now() - this.startTime) / 1000) | 0);

    if (left > 0) {
      setTimeout(this.tick, this.granularity);
    } else {
      left = 0;
      this.running = false;
      this.props.workspaceActions.setTimer({});
      this.props.uiActions.setSidebarVisible(true);
      this.toast.info(PROMPTS.TIMEBOX_OVER);
    }

    this.setState({ left });
  };

  parse(seconds) {
    let min = (seconds / 60) | 0;
    if (min < 10) min = `0${min}`;
    let sec = (seconds % 60) | 0;
    if (sec < 10) sec = `0${sec}`;
    return { min, sec };
  }

  stop = (e) => {
    e.stopPropagation();
    this.props.stop();
  };

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

const mapStateToProps = (state) => {
  return {
    timer: state.workspace.timer || {},
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    workspaceActions: bindActionCreators(workspaceActions, dispatch),
    uiActions: bindActionCreators(uiActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Timer);
