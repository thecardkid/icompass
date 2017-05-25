'use strict';

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'underscore';

import * as uiActions from 'Actions/ui';

import Message from 'Components/Message.jsx';

import { KEYCODES, PIXELS } from 'Lib/constants';

class Chat extends Component {

    constructor(props, context) {
        super(props, context);

        this.sendMessage = this.sendMessage.bind(this);
        this.renderMessage = this.renderMessage.bind(this);
    }

    componentDidMount() {
        this.text = $('#message-text');

        this.text.on('keydown', (e) => {
            if (e.which === KEYCODES.ENTER) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    sendMessage() {
        this.props.socket.emitMessage();
        this.text.val('').focus();
    }

    renderMessage(m, i) {
        if (m.info)
            return <div key={'msg'+i} className="ic-chat-info">{m.text}</div>;

        let type = (m.username === this.props.me) ? 'bubble mine' : 'bubble theirs';

        return (
            <Message key={'msg'+i}
                color={this.props.nameToColor[m.username]}
                m={m}
                type={type}
            />
        );
    }

    render() {
        let bottom = this.props.show ? PIXELS.SHOW : PIXELS.HIDE_CHAT;
        let messages = _.map(this.props.messages, this.renderMessage);

        return (
            <div id="ic-chat" style={{bottom: bottom}}>
                <button className="ic-close-window" onClick={this.props.uiActions.toggleChat}>x</button>
                <div id="messages-container">
                    <div id="messages">
                        {messages}
                    </div>
                </div>
                <div id="composer">
                    <div id="textbox">
                        <textarea id="message-text"/>
                    </div>
                </div>
            </div>
        );
    }
}

Chat.propTypes = {
    socket: PropTypes.object.isRequired,
    me: PropTypes.string.isRequired,
    nameToColor: PropTypes.object.isRequired,
    messages: PropTypes.array.isRequired,
    show: PropTypes.bool.isRequired,
    uiActions: PropTypes.objectOf(PropTypes.func).isRequired,
};

function mapStateToProps(state) {
    return {
        nameToColor: state.users.nameToColor,
        me: state.users.me,
        messages: state.chat.messages,
        show: state.ui.showChat
    };
}

function mapDispatchToProps(dispatch) {
    return {
        uiActions: bindActionCreators(uiActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat);

