import React, { Component } from 'react'
import Message from './Message.jsx';
import _ from 'underscore';
import { keys } from '../utils/constants.js';

export default class Chat extends Component {

    constructor(props, context) {
        super(props, context);

        this.sendMessage = this.sendMessage.bind(this);
        this.renderMessage = this.renderMessage.bind(this);
    }

    componentDidMount() {
        $('#message-text').on('keydown', (e) => {
            if (e.which === keys.ENTER) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    sendMessage() {
        let text = $('#message-text').val();

        if (!text) return;
        this.props.socket.emit('message', {
            username: this.props.username,
            text: text
        });
        $('#message-text').val('');
        $('#message-text').focus();
    }

    renderMessage(m, i) {
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
        let bg = this.props.unread ? '#C21A03' : '';
        let bottom = this.props.show ? '0' : '-265px';
        let messages = _.map(this.props.messages, this.renderMessage);

        return (
            <div id="ic-chat" style={{bottom: bottom}}>
                <div id="header-bar" style={{background:bg}} onClick={this.props.toggle}>
                </div>
                <div id="messages-container">
                    <div id="messages">
                        <p id="warning">These messages will be cleared when you log out</p>
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

