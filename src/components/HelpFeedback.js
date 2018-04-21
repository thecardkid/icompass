import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';

export default class HelpFeedback extends Component {
  render() {
    return (
      <div id={'ic-help'}>
        <div id={'ic-help-button'}
            data-tip data-for="help-feedback">?</div>
        <ReactTooltip id="help-feedback" place="top" effect="solid">
          <span>Help & Feedback</span>
        </ReactTooltip>
      </div>
    );
  }
}
