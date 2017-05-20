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
    }

    componentDidMount() {
        this.eCode = $('#compass-code');
        this.eUsername = $('#username');
        this.eCenter = $('#compass-center');
        this.eEmail = $('#email');

        this.vCode = $('#validate-code');
        this.vUsername = $('#validate-username');
        this.vCenter = $('#validate-center');
        this.vEmail = $('#validate-email');

        this.props.route.socket.on('compass null', () => this.vCode.text(ERROR_MSG.CANT_FIND));

        $(window).on('resize', () => this.setState({vw: window.innerWidth, vh: window.innerHeight}));
    }

    validateCode() {
        let code = this.eCode.val();
        if (!code) {
            this.vCode.text(ERROR_MSG.REQUIRED);
            return false;
        } else if (code.length != 8) {
            this.vCode.text(ERROR_MSG.INVALID_CODE);
            return false;
        }
        return code;
    }

    validateUsername() {
        let username = this.eUsername.val();
        if (!username) {
            this.vUsername.text(ERROR_MSG.REQUIRED);
            return false;
        } else if (username.length > 15) {
            this.vUsername.text(ERROR_MSG.TEXT_TOO_LONG(15));
            return false;
        } else if (username.match(/\d+/g) != null) {
            this.vUsername.text(ERROR_MSG.HAS_NUMBER);
            return false;
        }
        return username;
    }

    validateCenter() {
        let center = this.eCenter.val();
        if (!center) {
            this.vCenter.text(ERROR_MSG.REQUIRED);
            return false;
        } else if (center.length > 30) {
            this.vCenter.text(ERROR_MSG.TEXT_TOO_LONG(30));
            return false;
        }
        return center;
    }

    validateEmail() {
        let email = this.eEmail.val();
        if (!email) return 0;

        if (REGEX.EMAIL.test(email)) {
            return email;
        } else {
            this.vEmail.text(ERROR_MSG.INVALID_EMAIL);
            return 1;
        }
    }

    clearErrors() {
        this.vCode.text('');
        this.vCenter.text('');
        this.vUsername.text('');
        this.vEmail.text('');
    }

    newCompass() {
        this.clearErrors();
        let username = this.validateUsername();
        let center = this.validateCenter();
        let email = this.validateEmail();

        if (!username || !center || email === 1) return;

        this.props.route.socket.emit('create compass', {
            center: center,
            username: username,
            email: email
        });
    }

    findCompass() {
        this.clearErrors();
        let code = this.validateCode();
        let username = this.validateUsername();

        if (!code || !username) return;

        this.props.route.socket.emit('find compass', {
            code: code,
            username: username
        });
    }

    setLoginType(type) {
        this.setState({loginType: type});
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
        if (this.state.loginType === LOGIN_TYPE.FIND) {
            return (
                <div className="section">
                    <h1>2. Finding</h1>
                </div>
            )
        } else if (this.state.loginType === LOGIN_TYPE.MAKE) {
            return (
                <div className="section">
                    <h1>2. Making a compass</h1>
                </div>
            )
        }
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

