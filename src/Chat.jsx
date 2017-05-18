import React, { Component } from 'react'
import Message from './Message.jsx';
import _ from 'underscore';
import { KEYCODES, COLORS, PIXELS } from '../utils/constants.js';

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
        let content = this.text.val();
        if (!content) return;
        this.props.socket.emit('message', {
            username: this.props.username,
            text: content
        });

        this.text.val('').focus();
    }

    renderMessage(m, i) {
        if (m.info)
            return <p key={'msg'+i} className="ic-chat-info">{m.text}</p>

        let type = (m.username === this.props.username) ?
            'bubble mine' : 'bubble theirs';

        return (
            <Message key={'msg'+i}
                color={this.props.colorMap[m.username]}
                m={m}
                type={type}
            />
        );
    }

    render() {
        let bg = this.props.unread ? COLORS.RED : COLORS.DARK;
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

