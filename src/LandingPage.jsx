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

        this.socket = io();
        this.state = {loginType: null, vw: window.innerWidth, vh: window.innerHeight};

        this.center = Shared.center.bind(this);
        this.newCompass = this.newCompass.bind(this);
        this.findCompass = this.findCompass.bind(this);
        this.setLoginType = this.setLoginType.bind(this);
        this.getFirst = this.getFirst.bind(this);
        this.getSecond = this.getSecond.bind(this);
        this.getThird = this.getThird.bind(this);
        this.validateFindInput = this.validateFindInput.bind(this);
        this.validateMakeInput = this.validateMakeInput.bind(this);
        this.toWorkspace = this.toWorkspace.bind(this);

        this.socket.on('mail sent', () => alert(PROMPTS.EMAIL_SENT));
        this.socket.on('mail not sent', () => alert(PROMPTS.EMAIL_NOT_SENT));
        this.socket.on('compass ready', (data) => this.setState({data: data}));
    }

    componentDidMount() {
        $(window).on('resize', this.updateWindowSize.bind(this));
    }

    componentWillUnmount() {
        $(window).off('resize', this.updateWindowSize);
    }

    updateWindowSize() {
        this.setState({vw: window.innerWidth, vh: window.innerHeight});
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

    validateEmail() {
        let email = $('#email').val();
        if (!email) return null;

        if (!REGEX.EMAIL.test(email)) {
            alert(ERROR_MSG.INVALID('Email'));
            return false;
        }

        return email;
    }

    newCompass(center, username) {
        this.socket.emit('create compass', {
            center: center,
            username: username,
        });
        this.setState({ username });
    }

    findCompass(code, username) {
        this.socket.emit('find compass', {
            code: code,
            username: username
        });
        this.setState({ username });
    }

    setLoginType(type) {
        $('#compass-center').val('');
        $('#compass-code').val('');
        $('#username').val('');
        this.setState({data: null, loginType: type});
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
                <h1>Are you finding or making a compass?</h1>
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
                <h1>I need some details</h1>
                <div className="prompt">{firstPrompt}</div>
                <div className="response"><input id={inputId} /></div>
                <div className="prompt">Your name (how others will see you)</div>
                <div className="response"><input id="username" /></div>
                <div id="error-message"></div>
                <button className="ic-button" onClick={cb}>let's go</button>
            </div>
        )
    }

    getNullNotification() {
        return (
            <div className="section third">
                <h1>Sorry!</h1>
                <h2>I couldn't find your compass. Do you have the right code?</h2>
            </div>
        );
    }

    toWorkspace() {
        let email = this.validateEmail();
        let d = this.state.data;

        if (email === false) return;

        if (email !== null) {
            this.socket.emit('send mail', {
                editCode: d.compass.editCode,
                viewCode: d.compass.viewCode,
                username: this.state.username,
                email: email
            });
        }

        this.props.route.ready(d);
    }

    getThird() {
        if (typeof this.state.data !== 'object' || this.state.data === null) return;

        // 3 cases: 1. null, 2. find or view code, 3. new compass -> ask for email
        if (this.state.data.compass === null)
            return this.getNullNotification();

        let c = this.state.data.compass;
        if (this.state.loginType === LOGIN_TYPE.MAKE) {
            return (
                <div className="section third">
                    <h1>{c.editCode}</h1>
                    <h2>This is your compass code. If you would like to email me this to you, enter your email below. Your email will not be saved.</h2>
                    <input id="email" type="text" />
                    <button className="ic-button" onClick={this.toWorkspace}>to workspace</button>
                </div>
            );
        }

        return (
            <div className="section third">
                <h1>{this.state.data.mode} access</h1>
                <h2>You will be logged in as {this.state.username}</h2>
                <button className="ic-button" onClick={this.toWorkspace}>to workspace</button>
            </div>
        )
    }

    render() {
        return (
            <div id="ic-landing" style={this.center(600,550)}>
                {this.getFirst()}
                {this.getSecond()}
                {this.getThird()}
            </div>
        );
    }
}

