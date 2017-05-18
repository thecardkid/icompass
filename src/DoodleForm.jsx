'use strict';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

let paint = false;

export default class DoodleForm extends Component {

    constructor(props, context) {
        super(props, context);

        this.addClick = this.addClick.bind(this);
        this.beginDraw = this.beginDraw.bind(this);
        this.draw = this.draw.bind(this);
        this.drawCanvas = this.drawCanvas.bind(this);
        this.makeDoodle = this.makeDoodle.bind(this);
    }

    componentDidMount() {
        this.canvas = $('#ic-doodle');
        this.state = {
            x: [], y: [], drag: []
        };

    }

    componentDidUpdate() {
        this.drawCanvas();
    }

    addClick(ev, evDrag) {
        let { x, y, drag } = this.state;
        x.push(ev.pageX - this.canvas.offset().left);
        y.push(ev.pageY - this.canvas.offset().top);
        drag.push(evDrag ? 1 : 0);
        this.setState({ x, y, drag });
    }

    beginDraw(e) {
        paint = true;
        this.addClick(e, false);
    }

    draw(e) {
        if (paint) this.addClick(e, true);
    }

    stopDraw(e) {
        paint = false;
    }

    drawCanvas() {
        if (!this.canvas) return;

        const ctx = this.refs.canvas.getContext('2d');
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.strokeStyle = "#000";
		ctx.lineJoin = "round";
		ctx.lineWidth = 5;

		let { x, y, drag } = this.state;

		for(var i=0; i < x.length; i++) {
			ctx.beginPath();
			if (drag[i] && i) {
                ctx.moveTo(x[i-1], y[i-1]);
			} else {
                ctx.moveTo(x[i]-1, y[i]);
			}
			ctx.lineTo(x[i], y[i]);
			ctx.closePath();
			ctx.stroke();
		}
    }

    makeDoodle() {
        let { x, y, drag } = this.state;
        this.props.save(x, y, drag);
    }

    render() {
        this.drawCanvas();

        return (
            <div className="ic-modal" id="ic-doodle-form" style={this.props.style}>
                <div id="ic-doodle-contents">
                    <h1>Doodle on a note</h1>
                    <canvas id="ic-doodle"
                        ref="canvas"
                        width="410"
                        height="250"
                        onMouseDown={this.beginDraw}
                        onMouseMove={this.draw}
                        onMouseLeave={this.stopDraw}
                        onMouseUp={this.stopDraw}
                        style={{background:this.props.bg}}>
                    </canvas>
                    <div id="ic-doodle-toolbar">
                        <button className="ic-button" onClick={this.makeDoodle}>ship it</button>
                        <button className="ic-button" onClick={this.props.close}>never mind</button>
                    </div>
                </div>
            </div>
        );
    }
}

