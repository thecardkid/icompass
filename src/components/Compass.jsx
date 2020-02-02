import $ from 'jquery';
import { DraggableCore } from 'react-draggable';
import React, { Component } from 'react';
import { isMobile } from 'react-device-detect';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import * as compassX from '../actions/compass';
import * as uiX from '../actions/ui';

import SelectArea from './SelectArea';
import NoteManager from '../components/NoteManager.jsx';
import NoteManagerViewOnly from '../components/NoteManagerViewOnly.jsx';
import MaybeTappable from '../utils/MaybeTappable';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket';
import Storage from '../utils/Storage';
import Toast from '../utils/Toast';

import { EDITING_MODE } from '../../lib/constants';

const QUADRANTS = [
  {
    id: 'observations',
    prompt: '2. What\'s happening? Why?',
    // decides how the x and y offset of the center
    // affect the quadrant's height and width
    xOffsetSign: 1,
    yOffsetSign: -1,
  },
  { id: 'principles',
    prompt: '3. What matters most?',
    xOffsetSign: 1,
    yOffsetSign: 1,
  },
  { id: 'ideas',
    prompt: '4. What ways are there?',
    xOffsetSign: -1,
    yOffsetSign: 1,
  },
  { id: 'experiments',
    prompt: '5. What\'s a step to try?',
    xOffsetSign: -1,
    yOffsetSign: -1,
  },
];

class Compass extends Component {
  constructor(props) {
    super(props);

    this.hasEditingRights = !this.props.viewOnly;
    this.state = {
      showFullTopic: false,
      isDraggingCenter: false,
      centerPosition: {
        // buffer these in the state to bypass redux when
        // updating them.
        x: props.compass.centerPosition.x,
        y: props.compass.centerPosition.y,
      },
    };

    if (this.hasEditingRights) {
      this.state.select = false;
      this.toast = Toast.getInstance();
      this.modal = Modal.getInstance();
      this.socket = Socket.getInstance();
      this.socket.subscribe({
        'center set': this.setCompassCenter,
        'center position set': this.setCompassCenterPosition,
      });
      if (props.compass.center.length === 0) {
        this.setPeopleInvolved();
      }
    }
  }

  componentDidMount() {
    this.props.uiX.setBookmark(Storage.hasBookmark(this.props.compass.editCode));
  }

  doubleClickCreate = (ev) => {
    this.setState({ select: false });

    if (ev.shiftKey) {
      this.socket.emitMetric('double click image');
      this.props.uiX.showImage(ev);
      return;
    }

    if (ev.altKey) {
      this.socket.emitMetric('double click doodle');
      this.props.uiX.showDoodle(ev);
      return;
    }

    this.socket.emitMetric('double click text');
    this.props.uiX.showNewNote(ev);
  };

  onTouchStart = (ev) => {
    // ignore if pinch
    if (isMobile && ev.touches.length === 2) {
      return;
    }
    if (this.longPress) {
      this.doubleClickCreate(ev);
    }
  };

  debouncedTouchStart = _.debounce(this.onTouchStart, 1000);

  onTouchRelease = () => {
    this.longPress = false;
  };

  onMouseDown = (ev) => {
    if (ev.target.className !== 'interactable') return;
    this.setState({ select: {x: ev.clientX, y: ev.clientY} });
  };

  onMouseUp = () => {
    this.setState({ select: false });
  };

  onClick = (ev) => {
    if (ev.target.className !== 'interactable') return;
    if (this.props.visualMode) {
      this.props.uiX.normalMode();
    }
  };

  renderQuadrant = (q) => {
    const { centerPosition } = this.state;
    const { vw, vh } = this.props.ui;
    return (
      <div className="ic-quadrant"
           key={`quadrant-${q.id}`}
           style={{
             width: vw * (0.5 + ((centerPosition.x - 0.5) * q.xOffsetSign)),
             height: vh * (0.5 + ((centerPosition.y - 0.5) * q.yOffsetSign)),
           }}
           id={q.id}>
        <div className={'interactable'}
             onDoubleClick={this.doubleClickCreate}
             onClick={this.onClick}
             onTouchStart={(e) => {
               e.persist();
               this.longPress = true;
               this.debouncedTouchStart(e);
             }}
             onTouchEnd={this.onTouchRelease}
             onMouseDown={this.onMouseDown}
             onMouseUp={this.onMouseUp} />
        <div>
          <h1>{q.id.toUpperCase()}</h1>
          <h2>{q.prompt}</h2>
        </div>
      </div>
    );
  };

  renderLabels = () => {
    const { centerPosition } = this.state;
    const left = (this.props.ui.vw * centerPosition.x) - 35;
    const top = (this.props.ui.vh * centerPosition.y) - 9;
    return (
      <div>
        <div className="ic-compass-label" style={{ left: 5, top: top }}>PRESENT</div>
        <div className="ic-compass-label" style={{ left: left, top: 5 }}>BIG PICTURE</div>
        <div className="ic-compass-label" style={{ right: 5, top: top }}>FUTURE</div>
        <div className="ic-compass-label" style={{ left: left, bottom: 5 }}>DETAILS</div>
      </div>
    );
  };

  setCompassCenter = (center) => {
    if (this.props.compass.center.length === 0) {
      // animate only if setting center for a new workspace
      this.animateQuadrants = true;
    }
    this.props.compassX.setCenter(center);
  };

  setCompassCenterPosition = (x, y) => {
    this.props.compassX.setCenterPosition(x, y);
    this.setState({
      centerPosition: { x, y },
    });
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
    this.modal.promptForCenter(this.toast.warn, (people) => {
      this.socket.emitSetCenter(this.props.compass._id, people);
    });
  };

  editPeopleInvolved = () => {
    this.modal.editCenter(this.props.compass.center, (edited) => {
      if (!edited) {
        return;
      }

      this.socket.emitSetCenter(this.props.compass._id, edited);
    });
  };

  showOrHideFullTopic = () => {
    this.setState({ showFullTopic: !this.state.showFullTopic });
  };

  renderPromptFirstQuestion() {
    return (
      <div>
        <div id="center" className="wordwrap" style={{
          top: Math.max((this.props.ui.vh - length) / 2, 0),
          left: Math.max((this.props.ui.vw - length) / 2, 0),
          width: length,
          height: length,
          zIndex: 5,
        }} onClick={this.setPeopleInvolved}>
          <p id="first-prompt">Start here</p>
        </div>
        <div id="hline" style={{ top: this.props.ui.vh / 2 - 2 }}/>
        <div id="vline" style={{ left: this.props.ui.vw / 2 - 2 }}/>
        {this.renderLabels()}
      </div>
    );
  }

  onCenterDragStart = () => {
    if (!this.props.ui.dragCenterEnabled) {
      return;
    }
    this.setState({ isDraggingCenter: true });
  };

  onCenterDragMove = ({ x, y }) => {
    if (!this.props.ui.dragCenterEnabled) {
      return;
    }
    const { vw, vh } = this.props.ui;
    this.setState({
      centerPosition: {
        x: Math.min(Math.max(x / vw, 0.25), 0.75),
        y: Math.min(Math.max(y / vh, 0.25), 0.75),
      },
    });
  };

  renderCenter = () => {
    const { center } = this.props.compass;
    const { centerPosition } = this.state;
    let css, length;
    if (center.length <= 40) {
      css = this.getCenterTextCss(11, length = 100);
    } else if (center.length <= 70) {
      css = this.getCenterTextCss(14, length = 120);
    } else {
      // center text at most 100
      css = this.getCenterTextCss(16, length = 140);
    }
    return (
      <DraggableCore
        onStart={this.onCenterDragStart}
        onDrag={this.onCenterDragMove}>
        <div>
          <div id="center"
               data-tip={'Double-click to edit'}
               data-for="center-tooltip"
               style={{
                 top: (this.props.ui.vh * centerPosition.y) - (length / 2),
                 left: (this.props.ui.vw * centerPosition.x) - (length / 2),
                 width: length,
                 height: length,
                 cursor: this.hasEditingRights ? 'pointer' : 'auto',
               }}
               onDoubleClick={this.hasEditingRights ? this.editPeopleInvolved : _.noop}>
            <p className="wordwrap" style={css}>{center}</p>
          </div>
          {this.hasEditingRights && !this.props.ui.dragCenterEnabled &&
            <ReactTooltip
              id={'center-tooltip'}
              place={'bottom'}
              type={Storage.getTooltipTypeBasedOnDarkTheme()}
              delayShow={200}
              effect={'solid'}/>
          }
        </div>
      </DraggableCore>
    );
  };

  cancelCenterDrag = () => {
    this.props.uiX.disableDragCenter();
    this.setState({
      isDraggingCenter: false,
      centerPosition: {
        x: this.props.compass.centerPosition.x,
        y: this.props.compass.centerPosition.y,
      },
    });
  };

  submitCenterDrag = () => {
    this.props.uiX.disableDragCenter();
    this.setState({ isDraggingCenter: false });
    this.socket.emitSetCenterPosition(this.props.compass._id, this.state.centerPosition.x, this.state.centerPosition.y);
  };

  renderCenterDragModal() {
    return (
      <div id={'center-drag-modal'}>
        <div className={'header'}>
          Click and drag the center to move it.
        </div>
        <div className={'actions'}>
          <button className={'cancel'} onClick={this.cancelCenterDrag}>
            Cancel
          </button>
          <button className={'accept'} onClick={this.submitCenterDrag}>
            Accept
          </button>
        </div>
      </div>
    );
  }

  renderTopic = () => {
    const { topic } = this.props.compass;
    let displayedTopic = topic;
    let needsTooltip = false;
    if (!this.state.showFullTopic) {
      const topicLengthCap = 35;
      if (topic.length > topicLengthCap) {
        needsTooltip = true;
        displayedTopic = '';
        const words = topic.split(' ');
        while (displayedTopic.length + words[0].length < topicLengthCap) {
          displayedTopic += words.shift() + ' ';
        }
        displayedTopic += '...';
      }
    }
    return (
      <div>
        <MaybeTappable onTapOrClick={this.showOrHideFullTopic}>
          <div id={'ic-compass-topic'}
               data-tip={this.state.showFullTopic ? 'Click to truncate' : 'Click to expand'}
               data-for="topic-tooltip">
            TOPIC: {displayedTopic}
          </div>
        </MaybeTappable>
        {needsTooltip &&
        <ReactTooltip id={'topic-tooltip'}
                      place={'top'}
                      type={Storage.getTooltipTypeBasedOnDarkTheme()}
                      effect={'solid'} />
        }
      </div>
    );
  };

  renderCompassStructure = () => {
    const { centerPosition } = this.state;
    return (
      <div>
        {this.renderCenter()}
        {this.props.ui.dragCenterEnabled && this.renderCenterDragModal()}
        <div id="hline" style={{ top: (this.props.ui.vh * centerPosition.y) - 2 }}/>
        <div id="vline" style={{ left: (this.props.ui.vw * centerPosition.x) - 2 }}/>
        {_.map(QUADRANTS, this.renderQuadrant)}
        {this.renderLabels()}
        {this.renderTopic()}
      </div>
    );
  };

  render() {
    if (this.props.viewOnly) {
      this.fadeInQuadrants(0);
      return (
        <div id={'compass'}>
          <NoteManagerViewOnly/>
          {this.renderCompassStructure()}
        </div>
      );
    }

    let compass;
    if (this.props.compass.center.length === 0) {
      compass = this.renderPromptFirstQuestion();
    } else {
      if (this.animateQuadrants) {
        this.animateQuadrants = false;
        this.fadeInQuadrants(800);
        setTimeout(() => {
          this.toast.info('You\'re all set up! Double click anywhere to get started.');
        }, 3250);
      } else {
        this.fadeInQuadrants(0);
      }
      compass = this.renderCompassStructure();
    }

    return (
      <div id="compass" style={{
        width: this.props.ui.vw,
        maxWidth: this.props.ui.vw,
        height: this.props.ui.vh,
        maxHeight: this.props.ui.vh,
      }}>
        <NoteManager/>
        {this.props.ui.bookmarked && <div id={'ic-bookmark-indicator'}><i className={'material-icons'}>bookmark</i></div>}
        <SelectArea show={this.state.select} done={this.onMouseUp}/>
        {compass}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    compass: state.compass,
    ui: state.ui,
    visualMode: state.ui.editingMode === EDITING_MODE.VISUAL,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
    compassX: bindActionCreators(compassX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Compass);
