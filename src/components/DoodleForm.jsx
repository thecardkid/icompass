import $ from 'jquery';
import React, { Component } from 'react';

let paint = false;

export default class DoodleForm extends Component {
  componentDidMount() {
    this.canvas = $('#ic-doodle');
    $(document).on('touchstart', this.preventDefaultIfCanvas);
    $(document).on('touchmove', this.preventDefaultIfCanvas);
    this.setState({ x: [], y: [], drag: [] });
  }

  componentWillUnmount() {
    $(document).off('touchstart', this.preventDefaultIfCanvas);
    $(document).off('touchmove', this.preventDefaultIfCanvas);
  }

  componentDidUpdate() {
    this.drawCanvas();
  }

  preventDefaultIfCanvas(e) {
    if (e.target === document.getElementById('ic-doodle'))
      e.preventDefault();
  }

  addClick = (xPos, yPos, evDrag) => {
    let { x, y, drag } = this.state;
    x.push(xPos - this.canvas.offset().left);
    y.push(yPos - this.canvas.offset().top);
    drag.push(evDrag ? 1 : 0);
    this.setState({ x, y, drag });
  };

  beginDraw = (e) => {
    paint = true;
    this.addClick(e.clientX, e.clientY, false);
  };

  draw = (e) => {
    if (paint) this.addClick(e.clientX, e.clientY, true);
  };

  stopDraw = () => {
    paint = false;
  };

  beginTouchDraw = (e) => {
    paint = true;
    this.addClick(e.touches[0].clientX, e.touches[0].clientY, false);
  };

  touchDraw = (e) => {
    if (paint) this.addClick(e.touches[0].clientX, e.touches[0].clientY, true);
  };

  drawCanvas = () => {
    if (!this.canvas) return;

    const ctx = this.refs.canvas.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;

    let { x, y, drag } = this.state;

    for (let i = 0; i < x.length; i++) {
      ctx.beginPath();

      if (drag[i] && i) ctx.moveTo(x[i - 1], y[i - 1]);
      else ctx.moveTo(x[i] - 1, y[i]);

      ctx.lineTo(x[i], y[i]);
      ctx.closePath();
      ctx.stroke();
    }
  };

  makeDoodle = () => {
    if (this.state.x.length === 0) return;
    this.props.ship({
      text: null,
      doodle: document.getElementById('ic-doodle').toDataURL(),
      color: this.props.color,
      x: 0.5,
      y: 0.5,
      user: this.props.user,
    });
    this.props.close();
  };

  clearCanvas = () => {
    this.setState({ x: [], y: [], drag: [] });
  };

  render() {
    this.drawCanvas();

    return (
      <div className="ic-modal" id="ic-doodle-form" style={this.props.style}>
        <div>
          <h1>Doodle on a note</h1>
          <canvas id="ic-doodle"
                  ref="canvas"
                  width="410"
                  height="250"
                  onMouseDown={this.beginDraw}
                  onMouseMove={this.draw}
                  onMouseLeave={this.stopDraw}
                  onMouseUp={this.stopDraw}
                  onTouchStart={this.beginTouchDraw}
                  onTouchMove={this.touchDraw}
                  onTouchEnd={this.stopDraw}
                  style={{ background: this.props.bg }}>
          </canvas>
          <div id="ic-doodle-toolbar">
            <button name="nvm" className="ic-button" onClick={this.props.close}>never mind</button>
            <button className="ic-button" onClick={this.clearCanvas}>clear</button>
            <button name="ship" className="ic-button" onClick={this.makeDoodle}>ship it</button>
          </div>
        </div>
      </div>
    );
  }
}
