import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Message from './Message.jsx';
import _ from 'underscore';
import { KEYCODES, PIXELS } from '../utils/constants.js';

export default class Chat extends Component {

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
        this.props.emitMessage();
        this.text.val('').focus();
    }

    renderMessage(m, i) {
        if (m.info)
            return <p key={'msg'+i} className="ic-chat-info">{m.text}</p>;

        let type = (m.username === this.props.username) ? 'bubble mine' : 'bubble theirs';

        return (
            <Message key={'msg'+i}
                color={this.props.colorMap[m.username]}
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
                <button className="ic-close-window" onClick={this.props.toggleChat}>x</button>
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
    username: PropTypes.string.isRequired,
    colorMap: PropTypes.object.isRequired,
    toggleChat: PropTypes.func.isRequired,
    messages: PropTypes.array.isRequired,
    show: PropTypes.bool.isRequired,
    emitMessage: PropTypes.func.isRequired
};

