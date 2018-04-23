import React, { Component } from 'react';
import { COLORS } from '../../../lib/constants';

export default class StyleToolbar extends Component {
  render() {
    const selectedStyle = { background: COLORS.DARK, color: 'white' };
    const { selected, handler } = this.props;

    return (
      <div className="ic-text-ibu">
        <button name="underline"
                style={selected.underline ? selectedStyle : null}
                onClick={handler('underline')}>
          <u>U</u>
        </button>
        <button name="italic"
                style={selected.italic ? selectedStyle : null}
                onClick={handler('italic')}>
          <i>I</i>
        </button>
        <button name="bold"
                style={selected.bold ? selectedStyle : null}
                onClick={handler('bold')}>
          <b>B</b>
        </button>
      </div>
    );
  }
}
