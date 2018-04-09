import React, { Component } from 'react';

export default class Feedback extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.show !== nextProps.show;
  }

  render() {
    if (!this.props.show) return null;

    return (
      <div id="ic-backdrop">
        <div id="ic-privacy-statement" className="ic-smallform" style={this.props.style}>
          <button className="ic-close-window" onClick={this.props.close}>x</button>
          <div id="ic-privacy-contents" className="ic-smallform-contents">
            <h1>Privacy Statement</h1>
            <p>iCompass will not share your Compass, code, data, or any personal information included in your compass
              with any third party.</p>
            <p>
              Anyone who has your Compass&apos; edit code with will be able to modify, add,
              or delete any and all data in your Compass. Save and share your Compass link with care,
              and ask any collaborator to do the same.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
