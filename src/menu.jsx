'use strict';

import React, { Component } from 'react';
import _ from 'underscore';
import { controls } from '../utils/constants.js';

class Menu extends Component {
    constructor(props, context) {
        super(props, context);

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
                    <div className="ic-menu-list">
                        <h2>Share</h2>
                        <p><span className="code">{this.props.editCode}</span> edit</p>
                        <p><span className="code">{this.props.viewCode}</span> view</p>
                    </div>
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

