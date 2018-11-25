import $ from 'jquery';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import Tappable from 'react-tappable/lib/Tappable';
import { bindActionCreators } from 'redux';

import * as uiX from '../actions/ui';

import BookmarkList from '../components/BookmarkList.jsx';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket';
import Storage from '../utils/Storage';
import Toast from '../utils/Toast';

import { REGEX } from '../../lib/constants';

class LandingPage extends Component {
  constructor(props) {
    super(props);
    this.toast = Toast.getInstance();
    this.modal = Modal.getInstance();

    this.socket = Socket.getInstance();
    this.socket.subscribe({
      'compass ready': this.onCompassReady,
    });

    ReactGA.pageview('/');
    this.props.uiX.setScreenSize(window.innerWidth, window.innerHeight);
  }

  componentDidMount() {
    this.start = Date.now();
    $(window).on('resize', this.props.uiX.resize);
  }

  componentWillUnmount() {
    $(window).off('resize', this.props.uiX.resize);
  }

  onCompassReady = (data) => {
    if (!data.success) {
      return this.modal.alert({
        heading: 'Whoops...',
        body: 'Something went wrong. Please <a href="mailto:hieumaster95@gmail.com"><u>let me know.</u></a>',
      });
    }

    this.remindBookmark(data);
    this.setState({ data });
  };

  validateMakeInput = (e) => {
    e.preventDefault();

    const topic = this.refs.topic.value;
    const username = this.refs.username.value;

    if (!REGEX.CHAR_ONLY.test(username)) {
      return this.toast.error('Username cannot contain spaces or numbers, only letters.');
    }

    this.setState({ username });
    this.socket.emitCreateCompass(topic, username);
    this.socket.emitMetricLandingPage(this.start, Date.now(), 'create');
  };

  remindBookmark = ({ topic, code }) => {
    this.modal.prompt({
      heading: 'To access this workspace again..',
      body: [
        'Please bookmark this workspace (or you can note down the URL somewhere). You can give it an easy-to-remember name',
        'If you select "Nah", you can always find the bookmark action under the "Menu" icon in the top left corner.',
      ],
      defaultValue: topic,
      confirmText: 'Bookmark',
      cancelText: 'Nah, I\'ll remember',
      cb: (submit, bookmarkName) => {
        if (submit) {
          Storage.addBookmark(bookmarkName, code, this.state.username);
          this.toast.success('Bookmarked this workspace!');
          this.props.uiX.setBookmark(true);
        }
        browserHistory.push(`/compass/edit/${code}/${this.state.username}`);
      },
    });
  };

  sizeImage() {
    const r = 1.9174434087882823;
    const { vw, vh } = this.props.ui;
    const screenRatio = vw / vh;

    if (screenRatio <= r) {
      return {
        width: r * vh,
        height: vh,
      };
    } else {
      return {
        width: vw,
        height: vw / r,
      };
    }
  }

  render() {
    return (
      <div id={'ic-landing'}>
        <Tappable onTap={this.toast.clear}>
          <div id="ic-toast" onClick={this.toast.clear} />
        </Tappable>
        <img src={'https://s3.us-east-2.amazonaws.com/innovatorscompass/landing.jpg'} className={'ic-background'} style={this.sizeImage()}/>
        <BookmarkList start={this.start}/>
        <div id={'ic-landing-container'}>
          <div id={'message'}>
            <h1>Innovators' Compass</h1>
            <h2>Powerful questions, and space to explore them, to make anything better.</h2>
          </div>
          <div id={'get-started-form'}>
            <form onSubmit={this.validateMakeInput}>
              <p>What topic are you working on?</p>
              <input id="compass-center"
                     ref="topic"
                     required />
              <p>Your first name</p>
              <input id="username"
                     ref="username"
                     maxLength={15}
                     required />
              <br/>
              <button type="submit">
                Get started
                <i className="material-icons">arrow_forward</i>
              </button>
            </form>
          </div>
          <a href={'https://youtu.be/3IbxFHQ5Dxo'} className={'ic-guide'}>
            First-timer? Watch this <u>short two-minute video</u>!
          </a>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ui: state.ui,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
