import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Feedback extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.show !== nextProps.show;
  }

  render() {
    if (!this.props.show) return null;

    return (
      <div id="ic-backdrop">
        <div id="ic-feedback" className="ic-smallform" style={this.props.style}>
          <button className="ic-close-window" onClick={this.props.close}>x</button>
          <div id="ic-feedback-contents" className="ic-smallform-contents">
            <h1>Hi there!</h1>
            <p>Please reach out to us (under credits) with your <b>experiences and questions</b> about using the
              Innovators&#39; Compass - they are a huge help!</p>
            <p>If you would like to report a bug or request a feature, go <Link
              to="https://github.com/thecardkid/innovators-compass/issues" target="_blank"
              rel="noopener noreferrer">here</Link> and click <em>New issue</em>.</p>
            <p>If you are reporting a bug, please list the steps to reproduce it.</p>
            <p>If requesting a feature, please be detailed.</p>
            <p>If you are a developer, feel free to open a Pull Request.</p>
          </div>
        </div>
      </div>
    );
  }
}
