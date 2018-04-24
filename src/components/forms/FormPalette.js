import React, { Component } from 'react';
import _ from 'underscore';

import { STICKY_COLORS } from '../../../lib/constants';

export default class FormPalette extends Component {
  render() {
    return (
      <div className={'ic-form-palette'}>
        {_.map(STICKY_COLORS, (color) => {
          return (
            <span className={`ic-palette-color ic-color-${color.substring(1)}`}
                  key={`color${color}`}
                  style={{background: color}}
                  onClick={this.props.setColor(color)}
            />
          );
        })}
      </div>
    );
  }
}
