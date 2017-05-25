'use strict';

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import _ from 'underscore';

import * as uiActions from 'Actions/ui';

import { VERSION, TWEET, HOST, PROMPTS, CONTROLS, PIXELS, COLORS } from 'Lib/constants';

class Sidebar extends Component {

    constructor(props, context) {
        super(props, context);

        this.controlList = _.map(CONTROLS, this.renderControl);
        this.showSavePrompt = this.showSavePrompt.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.tweetThis = this.tweetThis.bind(this);
        this.shareEditCode = this.shareEditCode.bind(this);
        this.shareViewCode = this.shareViewCode.bind(this);
        this.renderShareList = this.renderShareList.bind(this);
        this.renderControlList = this.renderControlList.bind(this);
        this.renderUserList = this.renderUserList.bind(this);
        this.renderConnectionStatus = this.renderConnectionStatus.bind(this);
        this.renderActionList = this.renderActionList.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.users !== nextProps.users)
            return true;

        if (this.props.users && this.props.users.length !== nextProps.users.length)
            return true;

        return (
            this.props.socket.socket.disconnected !== nextProps.socket.socket.disconnected ||
            this.props.show !== nextProps.show ||
            this.props.you !== nextProps.you
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
            this.props.socket.emitDeleteCompass();
    }

    renderShareList() {
        return (
            <div className="ic-sidebar-list">
                <h2>Share</h2>
                <button name="share-edit" id={this.props.editCode} className="ic-action" onClick={this.shareEditCode}>edit code</button>
                <button name="share-view" id={this.props.viewCode} className="ic-action" onClick={this.shareViewCode}>view code</button>
                <button className="ic-action" onClick={this.showSavePrompt}>export to pdf</button>
                <button name="tweet" className="ic-action tweet" onClick={this.tweetThis}>tweet this</button>
            </div>
        );
    }

    renderControlList() {
        return (
            <div className="ic-sidebar-list">
                <h2>Controls</h2>
                {this.controlList}
            </div>
        );
    }

    renderUserList() {
        let userList = _.map(this.props.users, this.renderUserColor.bind(this));
        return (
            <div className="ic-sidebar-list">
                <h2>Collaborators</h2>
                {userList}
            </div>
        );
    }

    renderConnectionStatus() {
        let connectionStatus = this.props.socket.socket.disconnected ?
            <p style={{color:COLORS.RED}}>Disconnected</p> :
            <p style={{color:COLORS.GREEN}}>Connected</p>;
        return (
            <div className="ic-sidebar-list">
                <h2>Status</h2>
                {connectionStatus}
            </div>
        );
    }

    renderActionList() {
        return (
            <div className="ic-sidebar-list">
                <h2>Actions</h2>
                <button name="sucks" className="ic-action" onClick={this.props.uiActions.toggleFeedback}>feedback</button>
                <button name="tutorial" className="ic-action"><Link to="/tutorial" target="_blank" rel="noopener noreferrer">tutorial</Link></button>
                <button name="destroyer" className="ic-action dangerous" onClick={this.confirmDelete}>delete compass</button>
            </div>
        );
    }

    renderCreditsList() {
        return (
            <div className="ic-sidebar-list">
                <h2>Credits</h2>
                <p>compass by
                    <Link to="http://innovatorscompass.org" target="_blank" rel="noopener noreferrer"> Ela Ben-Ur</Link>
                </p>
                <p>app by
                    <Link href="http://hieuqn.com" target="_blank" rel="noopener noreferrer"> Hieu Nguyen</Link>
                </p>
            </div>
        );
    }

    renderVersionList() {
        return (
            <div className="ic-sidebar-list">
                <h2>Version</h2>
                <p>iCompass {VERSION}</p>
                <p>
                    <Link to="https://github.com/thecardkid/innovators-compass/releases" target="_blank" rel="noopener noreferrer">changelog</Link>
                </p>
            </div>
        );
    }

    render() {
        let style = {left: this.props.show ? PIXELS.SHOW : PIXELS.HIDE_SIDEBAR};

        return (
            <div id="ic-sidebar" style={style}>
                <div id="ic-sidebar-scroll"><div id="ic-sidebar-contents">
                    <button name="close-sidebar" className="ic-close-window" onClick={this.props.uiActions.toggleSidebar}>x</button>
                    {this.renderShareList()}
                    {this.renderControlList()}
                    {this.renderUserList()}
                    {this.renderConnectionStatus()}
                    {this.renderActionList()}
                    {this.renderCreditsList()}
                    {this.renderVersionList()}
                </div></div>
            </div>
        );
    }
}

Sidebar.propTypes = {
    socket: PropTypes.object.isRequired,
    exportCompass: PropTypes.func,

    editCode: PropTypes.string.isRequired,
    viewCode: PropTypes.string.isRequired,
    users: PropTypes.object.isRequired,
    you: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,

    uiActions: PropTypes.objectOf(PropTypes.func).isRequired,
};

function mapStateToProps(state) {
    return {
        editCode: state.compass.editCode,
        viewCode: state.compass.viewCode,
        users: state.users.nameToColor,
        you: state.users.me,
        show: state.ui.showSidebar
    };
}

function mapDispatchToProps(dispatch) {
    return {
        uiActions: bindActionCreators(uiActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);

