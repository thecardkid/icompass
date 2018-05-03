import $ from 'jquery';
import React, { Component } from 'react';

export default class SelectArea extends Component {
  componentWillUpdate(nextProps) {
    $(window).on('mousemove', this.onMouseMove);
    $(window).on('mouseup', this.onMouseUp);
    const { x, y } = nextProps.show;
    if (nextProps.show.x && nextProps.show.y) {
      this.anchorX = x;
      this.anchorY = y;
      this.css = {};

      this.prevDiffX = 0;
      this.prevDiffY = 0;
    }
  }

  onMouseUp = () => {
    $(window).off('mousemove', this.onMouseMove);
    $(window).off('mouseup', this.onMouseUp);
    $('#select-area').removeAttr('style');
    this.props.done();
  };

  onMouseMove = (ev) => {
    if (!this.props.show) return;

    ev.preventDefault();
    const { clientX: x, clientY: y } = ev;

    const diffX = x - this.anchorX;
    const diffY = y - this.anchorY;
    const css = {...this.css};

    if (diffX < 0 && this.prevDiffX >= 0) {
      css.right = this.props.ui.vw - this.anchorX;
      delete css.left;
    } else if (diffX > 0 && this.prevDiffX <= 0) {
      css.left = this.anchorX;
      delete css.right;
    }

    if (diffY < 0 && this.prevDiffY >= 0) {
      css.bottom = this.props.ui.vh - this.anchorY;
      delete css.top;
    } else if (diffY > 0 && this.prevDiffY <= 0) {
      css.top = this.anchorY;
      delete css.bottom;
    }

    css.width = Math.abs(x - this.anchorX);
    css.height = Math.abs(y - this.anchorY);

    this.css = css;
    this.prevDiffX = diffX;
    this.prevDiffY = diffY;

    $('#select-area').removeAttr('style').css(css);
  };

  render() {
    if (!this.props.show) return null;

    return (
      <div id={'select-area-container'}>
        <div id={'select-area'} />
      </div>
    );
  }
}
