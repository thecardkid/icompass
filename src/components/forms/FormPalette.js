import React, { Component } from 'react';
import _ from 'underscore';

import { STICKY_COLORS } from '@utils/constants';
import Storage from '@utils/Storage';
import { getColorAttr } from '../../../test/cypress/data_cy';

export default class FormPalette extends Component {
  state = {
    show: false,
  };

  setOrToggle = (val) => () => {
    this.setState({ show: val == null ? !this.state.show: val });
  };

  setColor = (color) => () => {
    Storage.setStickyNoteColor(color);
    this.props.setColor(color);
    this.setOrToggle(false)();
  };

  render() {
    const options = _.map(STICKY_COLORS, color => {
      return (
        <span style={{background: color}}
              key={color}
              onClick={this.setColor(color)}
              data-cy={getColorAttr(color)}
              className={'ic-color'}
        />
      );
    });
    let s = {};
    if (!this.state.show) {
      s = {display: 'none'};
    }

    return (
      <div className={'ic-form-palette'}>
        <button style={{background: this.props.color}}
              className={'icon'}
              onBlur={this.setOrToggle(false)}
              onClick={this.setOrToggle()}>
          A
          <div className={'ic-options'} style={s}>
            {options}
          </div>
        </button>
      </div>
    );
  }
}
