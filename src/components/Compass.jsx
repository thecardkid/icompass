import $ from 'jquery';
import React, { Component } from 'react';
import Tappable from 'react-tappable/lib/Tappable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import * as compassX from '../actions/compass';
import * as uiX from '../actions/ui';

import StickyNote from '../components/StickyNote.jsx';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket';

const QUADRANTS = [
  { id: 'observations', prompt: '2. What\'s happening? Why?' },
  { id: 'principles', prompt: '3. What matters most?' },
  { id: 'ideas', prompt: '4. What ways are there?' },
  { id: 'experiments', prompt: '5. What\'s a step to try?' },
];

class Compass extends Component {
  constructor(props) {
    super(props);

    this.modal = new Modal();
    this.socket = new Socket(this);
    this.socket.subscribe({
      'center set': this.setCompassCenter,
    });

    this.quadrants = _.map(QUADRANTS, this.renderQuadrant);
  }

  renderNote = (note, i) => {
    return (
      <StickyNote key={`note${i}`}
                  note={note}
                  i={i}
                  submitDraft={this.props.submitDraft}
                  destroy={this.socket.emitDeleteNote} />
    );
  };

  renderQuadrant = (q) => {
    const { showNewNote } = this.props.uiX;

    return (
      <Tappable onPress={showNewNote} key={q.id}>
        <div onDoubleClick={showNewNote} className="ic-quadrant" id={q.id}>
          <div>
            <h1>{q.id.toUpperCase()}</h1>
            <h2>{q.prompt}</h2>
          </div>
        </div>
      </Tappable>
    );
  };

  renderLabels() {
    let left = this.props.ui.vw / 2 - 35,
      top = this.props.ui.vh / 2 - 9;

    return (
      <div>
        <div className="ic-compass-label" style={{ left: '5px', top: top }}>PRESENT</div>
        <div className="ic-compass-label" style={{ left: left, top: '5px' }}>BIG PICTURE</div>
        <div className="ic-compass-label" style={{ right: '5px', top: top }}>FUTURE</div>
        <div className="ic-compass-label" style={{ left: left, bottom: '5px' }}>DETAILS</div>
      </div>
    );
  }

  setCompassCenter = (center) => {
    this.animateQuadrants = true;
    this.props.compassX.setCenter(center);
    setTimeout(() => this.props.uiX.setSidebarVisible(true), 3000);
  };

  fadeInQuadrants = (deltaTimeMs) => {
    const start = 50;
    setTimeout(() => $('#observations').css({opacity: 1}), start);
    setTimeout(() => $('#principles').css({opacity: 1}), start + deltaTimeMs);
    setTimeout(() => $('#ideas').css({opacity: 1}), start + (2 * deltaTimeMs));
    setTimeout(() => $('#experiments').css({opacity: 1}), start + (3 * deltaTimeMs));
  };

  getCenterCss(r) {
    return {
      top: Math.max((this.props.ui.vh - r) / 2, 0),
      left: Math.max((this.props.ui.vw - r) / 2, 0),
      width: r,
      height: r,
    };
  }

  getCenterTextCss = (charPerLine, r, width) => {
    const lineHeight = 13;

    const words = this.props.compass.center.split(' ');
    let currLine = words.shift().length;
    let numLines = 0;

    while (words.length > 0) {
      let w = words.shift();
      if (currLine + w.length + 1 > charPerLine) {
        numLines++;
        currLine = w.length;
      } else {
        currLine += w.length + 1;
      }
    }
    if (currLine > 0) numLines++;

    let textHeight = lineHeight * numLines;
    return {
      marginTop: (r - textHeight) / 2,
      width,
    };
  };

  setPeopleInvolved = () => {
    this.modal.prompt('1. Who could be involved, including you? For and with everyone involved, explore!', (res, people) => {
      if (!res) return this.setPeopleInvolved();

      this.socket.emitSetCenter(this.props.compass._id, people);
    });
  };

  renderPromptFirstQuestion() {
    const style = Object.assign(this.getCenterCss(100, 100), {zIndex: 5});
    return (
      <div>
        <div id="center" className="wordwrap" style={style} onClick={this.setPeopleInvolved}>
          <p id="first-prompt">Start here</p>
        </div>
        <div id="hline" style={{ top: this.props.ui.vh / 2 - 2 }}/>
        <div id="vline" style={{ left: this.props.ui.vw / 2 - 2 }}/>
        {this.renderLabels()}
      </div>
    );
  }

  renderCompassStructure = () => {
    const { center } = this.props.compass;

    let css, length;
    if (center.length <= 40) {
      css = this.getCenterTextCss(11, length = 100);
    } else if (center.length <= 70) {
      css = this.getCenterTextCss(14, length = 120);
    } else {
      css = this.getCenterTextCss(16, length = 140);
    }

    return (
      <div>
        <div id="center" style={this.getCenterCss(length, length)}>
          <p className="wordwrap" style={css}>{center}</p>
        </div>
        <div id="hline" style={{ top: this.props.ui.vh / 2 - 2 }}/>
        <div id="vline" style={{ left: this.props.ui.vw / 2 - 2 }}/>
        {this.quadrants}
        {this.renderLabels()}
      </div>
    );
  };

  render() {
    let compass;
    if (this.props.compass.center.length === 0) {
      compass = this.renderPromptFirstQuestion();
    } else {
      if (this.animateQuadrants) {
        this.animateQuadrants = false;
        this.fadeInQuadrants(800);
      } else {
        this.fadeInQuadrants(0);
      }

      compass = this.renderCompassStructure();
    }


    return (
      <div id="compass">
        {compass}
        {_.map(this.props.notes, this.renderNote)}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    compass: state.compass,
    notes: state.notes,
    ui: state.ui,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
    compassX: bindActionCreators(compassX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Compass);
