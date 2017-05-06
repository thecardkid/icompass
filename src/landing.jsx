'use strict';

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

class Landing extends Component {
    constructor(props, context) {
        super(props, context);

        this.newCompass = this.newCompass.bind(this);
        this.loadCompass = this.loadCompass.bind(this);
    }

    newCompass() {
        let username = $('#username').val();
        let root = this;
        fetch('/api/compass/create', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        .then((response) => response.json())
        .then((responseJson) => {
            root.props.route.setCompass(responseJson.compass, username);
        })
        .catch((e) => console.error(e));
    }

    loadCompass() {
        let id = $('#compass-id').val();
        let username = $('#username').val();
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
            root.props.route.setCompass(responseJson.compass, username);
        })
        .catch((e) => console.error(e));
    }

    render() {
        return (
            <div id="landing">
                <p>Enter ID:</p>
                <input id="compass-id" type="text" placeholder="Compass ID"/>
                <input id="username" type="text"/>
                <button onClick={this.loadCompass}>Load</button>
                <button onClick={this.newCompass}>New</button>
            </div>
        );
    }
}

export default Landing;

