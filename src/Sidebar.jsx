'use strict';

import React, { Component } from 'react';
import _ from 'underscore';
import { controls } from '../utils/constants.js';

export default class Sidebar extends Component {

    constructor(props, context) {
        super(props, context);
        this.controlList = _.map(controls, this.renderControl);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.users !== nextProps.users)
            return true;

        if (this.props.users)
            if (this.props.users.length !== nextProps.users.length)
                return true;

        return (
            this.props.disconnected !== nextProps.disconnected ||
            this.props.show !== nextProps.show
        );
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

    render() {
        let userList = _.map(this.props.users, this.renderUserColor.bind(this));

        let style = {
            left: this.props.show ? '0' : '-240px',
        };

        let connectionStatus = this.props.disconnected ?
            <p style={{color:'red'}}>Disconnected</p> :
            <p style={{color:'green'}}>Connected</p>;

        return (
            <div id="ic-menu" style={style}>
                <div id="ic-menu-contents">
                    <button className="ic-close-window" onClick={this.props.toggleSidebar}>x</button>
                    <div className="ic-menu-list">
                        <h2>Share</h2>
                        <p><span className="code">{this.props.editCode}</span> edit</p>
                        <p><span className="code">{this.props.viewCode}</span> view</p>
                    </div>
                    <div className="ic-menu-list">
                        <h2>Controls</h2>
                        {this.controlList}
                    </div>
                    <div className="ic-menu-list">
                        <h2>Collaborators</h2>
                        {userList}
                    </div>
                    <div className="ic-menu-list">
                        <h2>Status</h2>
                        {connectionStatus}
                    </div>
                    <div className="ic-menu-list">
                        <h2>Credits</h2>
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

