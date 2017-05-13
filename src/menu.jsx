'use strict';

import React, { Component } from 'react';
import _ from 'underscore';

const controls = {
    'n': 'new post-it',
    'm': 'toggle menu',
    'w': 'what is this?',
    'h': 'help page',
};

class Menu extends Component {
    constructor(props, context) {
        super(props, context);

        this.copyCode = this.copyCode.bind(this);
        this.renderUserColor = this.renderUserColor.bind(this);
    }

    renderUserColor(color, username) {
        return (
            <p key={username}>
                <span style={{background: color}}>     </span>
                {username === this.props.you ? 'You' : username}
            </p>
        );
    }

    renderControl(action, key) {
        return (
            <p key={'control'+key}>
                <span className='ic-control-key'>{key}</span>
                {action}
            </p>
        );
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
            left: this.props.show ? '0' : '-240px',
        };

        let connectionStatus = this.props.disconnected ?
            <p style={{color:'red'}}>Disconnected</p> :
            <p style={{color:'green'}}>Connected</p>;

        return (
            <div id="ic-menu" style={style}>
                <div id="ic-menu-contents">
                    <button className="ic-close-window" onClick={this.props.toggleMenu}>x</button>
                    <h1>{this.props.id}</h1>
                    <p id="ic-menu-share" onClick={this.copyCode}>Share this code</p>
                    <div className="ic-menu-list">
                        <h2>Controls</h2>
                        {controlList}
                    </div>
                    <div className="ic-menu-list">
                        <h2>Collaborators</h2>
                        {userList}
                    </div>
                    <div className="ic-menu-list">
                        <h2>Status</h2>
                        {connectionStatus}
                    </div>
                    <div id="ic-menu-credits">
                        <p>Compass by
                            <a href="http://innovatorscompass.org" target="_blank"> Ela Ben-Ur</a>
                        </p>
                        <p>App by
                            <a href="http://hieuqn.com" target="_blank"> Hieu Nguyen</a>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

export default Menu;

