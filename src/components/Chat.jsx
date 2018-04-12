import $ from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Swipeable from 'react-swipeable';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import * as chatX from '../actions/chat';
import * as uiX from '../actions/ui';

import Message from '../components/Message.jsx';

import { KEYCODES, PIXELS } from '../../lib/constants';
import Socket from '../utils/Socket';

class Chat extends Component {
  constructor(props) {
    super(props);

    this.socket = Socket.getInstance();
    this.socket.subscribe({
      'new message': this.onNewMessage,
    });
  }

  onNewMessage = (message) => {
    this.props.chatX.newMessage(message);

    setTimeout(() => {
      // scroll to bottom of messages div
      $('#messages-container').scrollTop($('#messages').outerHeight());
    }, 100);

    if (!this.props.show) this.props.chatX.unread();
  };

  componentDidMount() {
    this.$text = $('#message-text');

    this.$text.on('keydown', (e) => {
      if (e.which === KEYCODES.ENTER) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  sendMessage = () => {
    this.socket.emitMessage(this.props.me, this.$text.val());
    this.$text.val('').focus();
  };

  renderMessage = (m, i) => {
    if (m.info) {
      return <div key={`msg${i}`} className="ic-chat-info">{m.text}</div>;
    }

    const type = (m.username === this.props.me) ? 'bubble mine' : 'bubble theirs';
    return (
      <Message key={'msg' + i}
               color={this.props.nameToColor[m.username]}
               m={m}
               type={type} />
    );
  };

  render() {
    const bottom = this.props.show ? PIXELS.SHOW : PIXELS.HIDE_CHAT;
    const messages = _.map(this.props.messages, this.renderMessage);
    const { toggleChat } = this.props.uiX;

    return (
      <div id="ic-chat" style={{ bottom: bottom }}>
        <Swipeable onSwipedDown={toggleChat}>
          <button className="ic-close-window" onClick={toggleChat}>x</button>
          <div id="messages-container">
            <div id="messages">{messages}</div>
          </div>
          <div id="composer">
            <div id="textbox">
              <textarea id="message-text"/>
            </div>
          </div>
        </Swipeable>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    nameToColor: state.users.nameToColor,
    me: state.users.me,
    messages: state.chat.messages,
    show: state.ui.showChat,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    chatX: bindActionCreators(chatX, dispatch),
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);

