'use strict';

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

class Landing extends Component {
    constructor(props, context) {
        super(props, context);

        this.newCompass = this.newCompass.bind(this);
        this.loadCompass = this.loadCompass.bind(this);
    }

    validateId() {
        let id = $('#compass-id').val();
        if (!id) {
            $('#validate-id').text('This is required');
            return false;
        } else if (id.length != 8) {
            $('#validate-id').text('Not a valid ID');
            return false;
        }
        return id;
    }

    validateUsername() {
        let username = $('#username').val();
        if (!username) {
            $('#validate-username').text('This is required');
            return false;
        } else if (username.length > 15) {
            $('#validate-username').text('Longer than 15 chars');
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
        .then((responseJson) => {
            root.props.route.setCompass(responseJson.compass, username);
        })
        .catch((e) => console.error(e));
    }

    loadCompass() {
        this.clearErrors();
        let id = this.validateId();
        let username = this.validateUsername();

        if (!id || !username) return;

        let root = this;
        fetch('/api/compass/load', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({'id': id})
        })
        .then((response) => response.json())
        .then((responseJson) => {
            console.log(responseJson);
            if (!responseJson.compass)
                $('#validate-id').text('Compass does not exist');
            else
                root.props.route.setCompass(responseJson.compass, username);
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
                                <td>Compass ID:</td>
                                <td><input id="compass-id" type="text"/></td>
                                <td id="validate-id"></td>
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
                    <button id="load-compass" onClick={this.loadCompass}>Find Compass</button>
                    <button id="make-compass" onClick={this.newCompass}>Make Compass</button>
                </div>
            </div>
        );
    }
}

export default Landing;

