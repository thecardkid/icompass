import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class Message extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div className="message">
        <div className={this.props.type} style={{ background: this.props.color }}>
          <p className="wordwrap">{this.props.m.text}</p>
        </div>
      </div>
    );
  }
}

Message.propTypes = {
  type: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  m: PropTypes.object.isRequired,
};
