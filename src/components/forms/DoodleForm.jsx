import $ from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { bindActionCreators } from 'redux';

import * as uiX from '../../actions/ui';

import Socket from '../../utils/Socket';

let paint = false;

class DoodleForm extends Component {
  constructor() {
    super();
    this.socket = Socket.getInstance();
  }

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

  submit = (isDraft) => () => {
    if (this.state.x.length === 0) return;
    this.socket.emitMetric('note doodle');
    const { x, y } = this.props.info;
    const note = {
      text: null,
      doodle: document.getElementById('ic-doodle').toDataURL(),
      color: this.props.bg,
      user: this.props.user,
      x, y,
    };

    if (isDraft) this.props.asDraft(note);
    else this.props.asNote(note);
    this.props.close();
  };

  clearCanvas = () => {
    this.setState({ x: [], y: [], drag: [] });
  };

  switchText = () => {
    this.socket.emitMetric('switch doodle to text');
    this.props.uiX.switchToText();
  };

  switchImage = () => {
    this.socket.emitMetric('switch doodle to image');
    this.props.uiX.switchToImage();
  };

  dontClose(e) {
    e.stopPropagation();
  }

  render() {
    this.drawCanvas();

    return (
      <div id={'ic-backdrop'} onClick={this.props.close}>
        <div className="ic-modal ic-form" id="ic-doodle-form" onClick={this.dontClose}>
          <div className={'ic-modal-contents'}>
            <div className={'ic-modal-header'}>
              <h1 className={'ic-modal-title'}>Create a sketch</h1>
              <button name="clear" onClick={this.clearCanvas}>clear</button>
            </div>
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
            <div className="note-form-footer">
              <div>
                <button className={'switch-form switch-text'}
                        data-tip="Create a text note"
                        data-for="text-tooltip"
                        onClick={this.switchText}>
                  <i className={'material-icons'}>text_format</i>
                </button>
                <ReactTooltip id={'text-tooltip'} place={'top'} effect={'solid'}/>
                <button className={'switch-form switch-image'}
                        data-tip="Insert a photo"
                        data-for="doodle-tooltip"
                        onClick={this.switchImage}>
                  <i className={'material-icons'}>photo</i>
                </button>
                <ReactTooltip id={'doodle-tooltip'} place={'top'} effect={'solid'}/>
              </div>
              <button name="ship" onClick={this.submit(false)}>ship it</button>
              <button name={'draft'}
                      onClick={this.submit(true)}
                      data-tip="Drafts are invisible to others until you submit them"
                      data-for="draft-tooltip"
                      >as draft</button>
              <ReactTooltip id={'draft-tooltip'} place={'bottom'} effect={'solid'} delayShow={500}/>
              <button name="nvm" onClick={this.props.close}>never mind</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(() => ({}), mapDispatchToProps)(DoodleForm);
