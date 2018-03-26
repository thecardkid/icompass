import $ from 'jquery';
import PropTypes from 'prop-types';
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
    this.centerStyle = null;
    this.quadrants = _.map(QUADRANTS, this.renderQuadrant);
  }

  renderNote = (note, i) => {
    return (
      <StickyNote key={`note${i}`}
                  note={note}
                  i={i}
                  submitDraft={this.props.submitDraft}
                  destroy={this.props.destroy} />
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

  center(w, h) {
    return {
      top: Math.max((this.props.ui.vh - h) / 2, 0),
      left: Math.max((this.props.ui.vw - w) / 2, 0),
    };
  }

  calculateTextHeight(center) {
    let lines = Math.ceil(center.length / 11),
      textHeight = 13 * lines;
    this.centerStyle = { marginTop: (100 - textHeight) / 2 };
  }

  setPeopleInvolved = () => {
    this.modal.prompt('1. Who could be involved, including you? For and with everyone involved, explore!', (res, people) => {
      if (!res) return;

      this.socket.emitSetCenter(this.props.compass._id, people);
    });
  };

  renderPromptFirstQuestion() {
    const style = Object.assign(this.center(100, 100), {zIndex: 5});
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
    if (this.animateQuadrants) {
      this.animateQuadrants = false;
      this.fadeInQuadrants(800);
    } else {
      this.fadeInQuadrants(0);
    }

    if (!center) return this.renderPromptFirstQuestion();

    if (!this.centerStyle) this.calculateTextHeight(center);

    return (
      <div>
        <div id="center" className="wordwrap" style={this.center(100, 100)}>
          <p style={this.centerStyle}>{center}</p>
        </div>
        <div id="hline" style={{ top: this.props.ui.vh / 2 - 2 }}/>
        <div id="vline" style={{ left: this.props.ui.vw / 2 - 2 }}/>
        {this.quadrants}
        {this.renderLabels()}
      </div>
    );
  };

  render() {
    return (
      <div id="compass">
        {this.renderCompassStructure()}
        {_.map(this.props.notes, this.renderNote)}
      </div>
    );
  }
}

Compass.propTypes = {
  ui: PropTypes.object.isRequired,
  compass: PropTypes.object.isRequired,
  notes: PropTypes.array.isRequired,
  uiX: PropTypes.objectOf(PropTypes.func).isRequired,
  compassX: PropTypes.objectOf(PropTypes.func).isRequired,
  destroy: PropTypes.func,
  submitDraft: PropTypes.func,
};

function mapStateToProps(state) {
  return {
    compass: state.compass,
    ui: state.ui,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uiX: bindActionCreators(uiX, dispatch),
    compassX: bindActionCreators(compassX, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Compass);

