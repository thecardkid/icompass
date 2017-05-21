'use strict';

import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import { ERROR_MSG, PROMPTS } from '../utils/constants.js';

import Shared from './Shared.jsx';
import Validator from './Validator.jsx';

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
        this.socket.on('compass ready', (data) => this.setState({ data }));
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
        let code = Validator.validateCompassCode($('#compass-code').val());
        let username = Validator.validateUsername($('#username').val());

        if (!code[0]) return $('#error-message').text(code[1]);
        if (!username[0]) return $('#error-message').text(username[1]);

        this.findCompass(code[1], username[1]);
    }

    validateMakeInput() {
        $('#error-message').text('');
        let center = Validator.validateCenter($('#compass-center').val());
        let username = Validator.validateUsername($('#username').val());

        if (!center[0]) return $('#error-message').text(center[1]);
        if (!username[0]) return $('#error-message').text(username[1]);

        this.newCompass(center[1], username[1]);
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
                <h1>I need some info</h1>
                <div className="prompt">{firstPrompt}</div>
                <div className="response"><input id={inputId} /></div>
                <div className="prompt">Your name (how others will see you)</div>
                <div className="response"><input id="username" /></div>
                <div id="error-message"></div>
                <button className="ic-button" name="go" onClick={cb}>let&apos;s go</button>
            </div>
        );
    }

    getNullNotification() {
        return (
            <div className="section third">
                <h1>Sorry!</h1>
                <h2>I couldn&apos;t find your compass. Do you have the right code?</h2>
            </div>
        );
    }

    toWorkspace() {
        let email = $('#email').val();
        let valid = Validator.validateEmail(email);
        let d = this.state.data;

        if (email && !valid[0]) return alert(ERROR_MSG.INVALID('Email'));

        if (email && valid[0]) {
            this.socket.emit('send mail', {
                editCode: d.code,
                username: this.state.username,
                email: email
            });
        }

        switch(this.state.loginType) {
            case LOGIN_TYPE.MAKE:
                return browserHistory.push('/compass/edit/'+d.code+'/'+this.state.username);
            case LOGIN_TYPE.FIND:
                return browserHistory.push('/compass/'+d.mode+'/'+d.code+'/'+this.state.username);
        }
    }

    getThird() {
        if (typeof this.state.data !== 'object' || this.state.data === null) return;

        // 3 cases: 1. null, 2. find or view code, 3. new compass -> ask for email
        let d = this.state.data;
        if (!d.success)
            return this.getNullNotification();

        if (this.state.loginType === LOGIN_TYPE.MAKE) {
            return (
                <div className="section third">
                    <h1>{d.code}</h1>
                    <h2>This is your compass code. If you would like to email me this to you, enter your email below. Your email will not be saved.</h2>
                    <input id="email" type="text" />
                    <button className="ic-button" name="to-workspace" onClick={this.toWorkspace}>to workspace</button>
                </div>
            );
        }

        return (
            <div className="section third">
                <h1>{d.mode} access</h1>
                <h2>You will be logged in as {this.state.username}</h2>
                <button className="ic-button" name="to-workspace" onClick={this.toWorkspace}>to workspace</button>
            </div>
        );
    }

    render() {
        return (
            <div id="ic-landing" style={this.center(600,550)}>
                <div id="ic-tour"><Link to="/tutorial">First timer? Take the tour!</Link></div>
                {this.getFirst()}
                {this.getSecond()}
                {this.getThird()}
            </div>
        );
    }
}

