'use strict';

import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import { ERROR_MSG, PROMPTS, REGEX } from '../utils/constants.js';

import Shared from './Shared.jsx';

const LOGIN_TYPE = {
    MAKE: 0,
    FIND: 1
};

export default class LandingPage extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = {loginType: null, vw: window.innerWidth, vh: window.innerHeight};

        this.center = Shared.center.bind(this);
        this.newCompass = this.newCompass.bind(this);
        this.findCompass = this.findCompass.bind(this);
        this.setLoginType = this.setLoginType.bind(this);
        this.getFirst = this.getFirst.bind(this);
        this.getSecond = this.getSecond.bind(this);
        this.validateFindInput = this.validateFindInput.bind(this);
        this.validateMakeInput = this.validateMakeInput.bind(this);
    }

    componentDidMount() {
        this.props.route.socket.on('compass ready', (data) => this.setState({data: data}));

        $(window).on('resize', () => this.setState({vw: window.innerWidth, vh: window.innerHeight}));
    }

    validateCode() {
        let code = $('#compass-code').val(),
            error;
        if (!code)
            error = ERROR_MSG.REQUIRED('A code');
        else if (code.length != 8)
            error = ERROR_MSG.INVALID('Your code');

        if (error) {
            $('#error-message').text(error);
            return false;
        }

        return code;
    }

    validateUsername() {
        let username = $('#username').val(),
            error;

        if (!username)
            error = ERROR_MSG.REQUIRED('Username');
        else if (username.length > 15)
            error = ERROR_MSG.TEXT_TOO_LONG('Username', 15);
        else if (username.match(/\d+/g) != null)
            error = ERROR_MSG.UNAME_HAS_NUMBER;

        if (error) {
            $('#error-message').text(error);
            return false;
        }

        return username;
    }

    validateCenter() {
        let center = $('#compass-center').val(),
            error;

        if (!center)
            error = ERROR_MSG.REQUIRED('People group');
        else if (center.length > 30)
            error = ERROR_MSG.TEXT_TOO_LONG('People group', 30);

        if (error) {
            $('#error-message').text(error);
            return false;
        }

        return center;
    }

    validateEmail(email) {
        // let email = this.eEmail.val();
        if (!email) return 0;

        if (!REGEX.EMAIL.test(email))
            return ERROR_MSG.INVALID('Email');
    }

    clearErrors() {
        this.vCode.text('');
        this.vCenter.text('');
        this.vUsername.text('');
        this.vEmail.text('');
    }

    newCompass(center, username) {
        this.props.route.socket.emit('create compass', {
            center: center,
            username: username,
        });
    }

    findCompass(code, username) {
        this.props.route.socket.emit('find compass', {
            code: code,
            username: username
        });
    }

    setLoginType(type) {
        this.setState({loginType: type});
    }

    validateFindInput() {
        $('#error-message').text('');
        let code = this.validateCode();
        let username = this.validateUsername();

        if (!code || !username) return;

        this.findCompass(code, username);
    }

    validateMakeInput() {
        $('#error-message').text('');
        let center = this.validateCenter();
        let username = this.validateUsername();

        if (!center || !username) return;

        this.newCompass(center, username);
    }

    getFirst() {
        return (
            <div className="section">
                <h1>1. Are you finding or making a compass?</h1>
                <button className="ic-button" name="find" onClick={() => this.setLoginType(LOGIN_TYPE.FIND)}>finding</button>
                <button className="ic-button" name="make" onClick={() => this.setLoginType(LOGIN_TYPE.MAKE)}>making</button>
            </div>
        );
    }

    getSecond() {
        if (typeof this.state.loginType !== 'number') return;

        let firstPrompt, inputId, cb;

        if (this.state.loginType === LOGIN_TYPE.FIND) {
            firstPrompt = 'What is the code you were given?';
            inputId = 'compass-code';
            cb = this.validateFindInput;
        } else {
            firstPrompt = 'Whom is your people group?';
            inputId = 'compass-center';
            cb = this.validateMakeInput;
        }

        return (
            <div className="section">
                <h1>2. I need some details</h1>
                <div className="prompt">{firstPrompt}</div>
                <div className="response"><input id={inputId} /></div>
                <div className="prompt">Your name (how others will see you)</div>
                <div className="response"><input id="username" /></div>
                <div id="error-message"></div>
                <button className="ic-button" onClick={cb}>let's go</button>
            </div>
        )
   }

    render() {
        return (
            <div id="ic-landing" style={this.center(600,500)}>
                {this.getFirst()}
                {this.getSecond()}
            </div>
        );
    }
}

