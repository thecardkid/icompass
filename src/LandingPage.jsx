'use strict';

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { ERROR_MSG, PROMPTS, EMAIL_RE } from '../utils/constants.js';

export default class LandingPage extends Component {

    constructor(props, context) {
        super(props, context);

        this.newCompass = this.newCompass.bind(this);
        this.findCompass = this.findCompass.bind(this);
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

        if (EMAIL_RE.test(email)) {
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

    render() {
        return (
            <div id="landing">
                <div id="form">
                    <table><tbody>
                        <tr>
                            <td>Compass Code:</td>
                            <td><input id="compass-code" type="text" defaultValue={this.props.params.code}/></td>
                            <td id="validate-code"></td>
                        </tr>
                        <tr>
                            <td>Username:</td>
                            <td><input id="username" type="text" defaultValue={this.props.params.username}/></td>
                            <td id="validate-username"></td>
                        </tr>
                        <tr>
                            <td>Centered on:</td>
                            <td><input id="compass-center" type="text"/></td>
                            <td id="validate-center"></td>
                        </tr>
                        <tr>
                            <td>Email me my codes:</td>
                            <td><input id="email" type="text"/></td>
                            <td id="validate-email"></td>
                        </tr>
                    </tbody></table>
                    <button name="cFind" onClick={this.findCompass}>Find Compass</button>
                    <button name="cMake" onClick={this.newCompass}>Make Compass</button>
                </div>
            </div>
        );
    }
}

