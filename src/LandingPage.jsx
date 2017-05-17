'use strict';

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

export default class LandingPage extends Component {

    constructor(props, context) {
        super(props, context);

        this.newCompass = this.newCompass.bind(this);
        this.findCompass = this.findCompass.bind(this);
    }

    validateCode() {
        let code = $('#compass-code').val();
        if (!code) {
            $('#validate-code').text('This is required');
            return false;
        } else if (code.length != 8) {
            $('#validate-code').text('Not a valid code');
            return false;
        }
        return code;
    }

    validateUsername() {
        let username = $('#username').val();
        if (!username) {
            $('#validate-username').text('This is required');
            return false;
        } else if (username.length > 15) {
            $('#validate-username').text('Longer than 15 chars');
            return false;
        } else if (username.match(/\d+/g) != null) {
            $('#validate-username').text('Cannot contain numbers');
            return false;
        }
        return username;
    }

    validateCenter() {
        let center = $('#compass-center').val();
        if (!center) {
            $('#validate-center').text('This is required');
            return false;
        } else if (center.length > 15) {
            $('#validate-center').text('Longer than 15 chars');
            return false;
        }
        return center;
    }

    clearErrors() {
        $('#validate-center').text('');
        $('#validate-id').text('');
        $('#validate-username').text('');
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
            body: JSON.stringify({
                'center': center
            })
        })
        .then((response) => response.json())
        .then((responseJson) => root.props.route.setCompass(responseJson, username))
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
                $('#validate-code').text('Compass does not exist');
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

