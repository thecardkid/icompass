'use strict';

import React, { Component } from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import _ from 'underscore';

import { VERSION, TWEET, HOST, PROMPTS, CONTROLS, PIXELS, COLORS } from 'Lib/constants.js';

export default class Sidebar extends Component {

    constructor(props, context) {
        super(props, context);

        this.controlList = _.map(CONTROLS, this.renderControl);
        this.showSavePrompt = this.showSavePrompt.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.tweetThis = this.tweetThis.bind(this);
        this.shareEditCode = this.shareEditCode.bind(this);
        this.shareViewCode = this.shareViewCode.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.users !== nextProps.users)
            return true;

        if (this.props.users && this.props.users.length !== nextProps.users.length)
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

    showSavePrompt() {
        if (confirm(PROMPTS.EXPORT)) this.props.exportCompass();
    }

    shareEditCode() {
        window.prompt('Share this link below:', HOST + 'compass/edit/' + this.props.editCode);
    }

    shareViewCode() {
        window.prompt('Share this link below:', HOST + 'compass/view/' + this.props.viewCode);
    }

    tweetThis() {
        let tweetURL = TWEET + this.props.viewCode;
        window.open(tweetURL, '_blank').focus();
    }

    confirmDelete() {
        if (confirm(PROMPTS.CONFIRM_DELETE_COMPASS))
            this.props.destroy();
    }

    render() {
        let userList = _.map(this.props.users, this.renderUserColor.bind(this));
        let style = {left: this.props.show ? PIXELS.SHOW : PIXELS.HIDE_SIDEBAR};
        let connectionStatus = this.props.disconnected ?
            <p style={{color:COLORS.RED}}>Disconnected</p> :
            <p style={{color:COLORS.GREEN}}>Connected</p>;

        return (
            <div id="ic-sidebar" style={style}>
                <div id="ic-sidebar-scroll"><div id="ic-sidebar-contents">
                    <button name="close-sidebar" className="ic-close-window" onClick={this.props.toggleSidebar}>x</button>
                    <div className="ic-sidebar-list">
                        <h2>Share</h2>
                        <button name="share-edit" id={this.props.editCode} className="ic-action" onClick={this.shareEditCode}>edit code</button>
                        <button name="share-view" id={this.props.viewCode} className="ic-action" onClick={this.shareViewCode}>view code</button>
                        <button className="ic-action" onClick={this.showSavePrompt}>export to pdf</button>
                        <button name="tweet" className="ic-action tweet" onClick={this.tweetThis}>tweet this</button>
                    </div>
                    <div className="ic-sidebar-list">
                        <h2>Controls</h2>
                        {this.controlList}
                    </div>
                    <div className="ic-sidebar-list">
                        <h2>Collaborators</h2>
                        {userList}
                    </div>
                    <div className="ic-sidebar-list">
                        <h2>Status</h2>
                        {connectionStatus}
                    </div>
                    <div className="ic-sidebar-list">
                        <h2>Actions</h2>
                        <button name="sucks" className="ic-action" onClick={this.props.toggleFeedback}>feedback</button>
                        <button name="tutorial" className="ic-action"><Link to="/tutorial" target="_blank" rel="noopener noreferrer">tutorial</Link></button>
                        <button name="destroyer" className="ic-action dangerous" onClick={this.confirmDelete}>delete compass</button>
                    </div>
                    <div className="ic-sidebar-list">
                        <h2>Credits</h2>
                        <p>compass by
                            <Link to="http://innovatorscompass.org" target="_blank" rel="noopener noreferrer"> Ela Ben-Ur</Link>
                        </p>
                        <p>app by
                            <Link href="http://hieuqn.com" target="_blank" rel="noopener noreferrer"> Hieu Nguyen</Link>
                        </p>
                    </div>
                    <div className="ic-sidebar-list">
                        <h2>Version</h2>
                        <p>iCompass {VERSION}</p>
                        <p>
                            <Link to="https://github.com/thecardkid/innovators-compass/releases" target="_blank" rel="noopener noreferrer">changelog</Link>
                        </p>
                    </div>
                </div></div>
            </div>
        );
    }
}

Sidebar.propTypes = {
    users: PropTypes.object.isRequired,
    disconnected: PropTypes.bool.isRequired,
    editCode: PropTypes.string.isRequired,
    viewCode: PropTypes.string.isRequired,
    you: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    destroy: PropTypes.func.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
    exportCompass: PropTypes.func.isRequired,
    toggleFeedback: PropTypes.func.isRequired
};

