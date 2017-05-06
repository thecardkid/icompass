'use strict';

import React, { Component } from 'react';
import _ from 'underscore';
import { type } from '../utils';

const controls = {
    'o': 'new observation',
    'p': 'new principle',
    'i': 'new idea',
    'e': 'new experiment',
    'h': 'show help'
};

class Menu extends Component {
    constructor(props, context) {
        super(props, context);

        this.copyCode = this.copyCode.bind(this);
    }

    renderUserColor(color, username) {
        return (
            <p key={username}>
                <span style={{background: color}}>     </span>
                {username}
            </p>
        );
    }

    renderControl(action, key) {
        return (
            <p key={'control'+key}>
                <span className='keyboard'>{key}</span>
                {action}
            </p>
        )
    }

    copyCode() {
        if (window.navigator.platform === 'MacIntel')
            window.prompt('Copy to clipboard: Cmd+C, Enter', this.props.id);
        else
            window.prompt("Copy to clipboard: Ctrl+C, Enter", this.props.id);
    }

    render() {
        let userList = _.map(this.props.users, this.renderUserColor);
        let controlList = _.map(controls, this.renderControl);

        let style = {
            left: this.props.show ? '-240px' : '0',
        };

        return (
            <div id="menu" style={style}>
                <div id="menu-contents">
                    <button id="close-menu" onClick={this.props.toggleMenu}>x</button>
                    <h1>{this.props.id}</h1>
                    <p id="share" onClick={this.copyCode}>Share this code</p>
                    <div className="menu-list">
                        <h2>Controls</h2>
                        {controlList}
                    </div>
                    <div className="menu-list">
                        <h2>Collaborators</h2>
                        {userList}
                    </div>
                </div>
            </div>
        );
    }
}

export default Menu;

