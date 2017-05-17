'use strict';

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { ERROR_MSG, PROMPTS } from '../utils/constants.js';

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

        this.vCode = $('#validate-code');
        this.vUsername = $('#validate-username');
        this.vCenter = $('#validate-center');
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
            this.vUsername.text(ERROR_MSG.TEXT_TOO_LONG);
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
        } else if (center.length > 15) {
            this.vCenter.text(ERROR_MSG.TEXT_TOO_LONG);
            return false;
        }
        return center;
    }

    clearErrors() {
        this.vCode.text('');
        this.vCenter.text('');
        this.vUsername.text('');
    }

    newCompass() {
        this.clearErrors();
        let username = this.validateUsername();
        let center = this.validateCenter();

        if (!username || !center) return;

        let root = this;
        fetch('/api/compass/create', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({'center': center})
        })
        .then((response) => response.json())
        .then((responseJson) => {
            alert(PROMPTS.REMEMBER_CODE);
            root.props.route.setCompass(responseJson, username)
        })
        .catch((e) => console.error(e));
    }

    findCompass() {
        this.clearErrors();
        let code = this.validateCode();
        let username = this.validateUsername();

        if (!code || !username) return;

        let root = this;
        fetch('/api/compass/find', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({'code': code})
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if (!responseJson.compass)
                this.vCode.text(ERROR_MSG.CANT_FIND);
            else
                root.props.route.setCompass(responseJson, username);
        })
        .catch((e) => console.error(e));
    }

    render() {
        return (
            <div id="landing">
                <div id="form">
                    <table>
                        <tbody>
                            <tr>
                                <td>Compass Code:</td>
                                <td><input id="compass-code" type="text"/></td>
                                <td id="validate-code"></td>
                            </tr>
                            <tr>
                                <td>Username:</td>
                                <td><input id="username" type="text"/></td>
                                <td id="validate-username"></td>
                            </tr>
                            <tr>
                                <td>Centered on:</td>
                                <td><input id="compass-center" type="text"/></td>
                                <td id="validate-center"></td>
                            </tr>
                        </tbody>
                    </table>
                    <button onClick={this.findCompass}>Find Compass</button>
                    <button onClick={this.newCompass}>Make Compass</button>
                </div>
            </div>
        );
    }
}

