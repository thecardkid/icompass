'use strict';

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory, Link } from 'react-router';
import Swipeable from 'react-swipeable';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Timer from 'Components/Timer.jsx';

import Modal from 'Utils/Modal.jsx';
import Storage from 'Utils/Storage.jsx';
import Toast from 'Utils/Toast.jsx';

import * as uiActions from 'Actions/ui';

import { VERSION, TWEET, HOST, PROMPTS, MODALS, PIXELS, COLORS } from 'Lib/constants';

class Sidebar extends Component {

    constructor(props, context) {
        super(props, context);
        this.toast = new Toast();
        this.modal = new Modal();

        this.showSavePrompt = this.showSavePrompt.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.tweetThis = this.tweetThis.bind(this);
        this.shareEditLink = this.shareEditLink.bind(this);
        this.shareViewOnlyLink = this.shareViewOnlyLink.bind(this);
        this.save = this.save.bind(this);
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
            this.props.connected !== nextProps.connected ||
            this.props.show !== nextProps.show ||
            this.props.you !== nextProps.you
        );
    }

    renderUserColor(color, username) {
        let label = username === this.props.you ? 'You [ '+username+' ]' : username;
        return (
            <p key={username} className="ic-user" style={{background: color}}>
                {label}
            </p>
        );
    }

    showSavePrompt() {
        this.modal.confirm(MODALS.EXPORT_PDF, (exportAsPDF) => {
            if (exportAsPDF) this.props.exportCompass();
        });
    }

    shareEditLink() {
        this.modal.alert(MODALS.SHARE_LINK(HOST + 'compass/edit/' + this.props.compass.editCode));
    }

    shareViewOnlyLink() {
        this.modal.alert(MODALS.SHARE_LINK(HOST + 'compass/view/' + this.props.compass.viewCode));
    }

    tweetThis() {
        let tweetURL = TWEET + this.props.compass.viewCode;
        window.open(tweetURL, '_blank').focus();
    }

    confirmDelete() {
        this.modal.confirm(MODALS.DELETE_COMPASS, (deleteCompass) => {
            if (deleteCompass) {
                Storage.removeBookmarkByCenter(this.props.compass.center);
                this.props.destroy();
            }
        });
    }

    renderShareList() {
        return (
            <div className="ic-sidebar-list" name="share">
                <h2>Share</h2>
                <button name="save" className="ic-action bookmark" onClick={this.save}>
                    <i className="material-icons">star</i>
                    <p>bookmark</p>
                </button>
                <button name="share-edit" id={this.props.compass.editCode} className="ic-action" onClick={this.shareEditLink}>
                    <i className="material-icons">edit</i>
                    <p>editing link</p>
                </button>
                <button name="share-view" id={this.props.compass.viewCode} className="ic-action" onClick={this.shareViewOnlyLink}>
                    <i className="material-icons">remove_red_eye</i>
                    <p>view-only link</p>
                </button>
                <button name="export" className="ic-action" onClick={this.showSavePrompt}>
                    <i className="material-icons">picture_as_pdf</i>
                    <p>export to pdf</p>
                </button>
                <button name="tweet" className="ic-action tweet" onClick={this.tweetThis}>
                    <i className="fa fa-twitter" style={{color:'white'}}></i>
                    <p>tweet this</p>
                </button>
            </div>
        );
    }

    renderControlList() {
        return (
            <div className="ic-sidebar-list" name="controls">
                <h2>Controls</h2>
                <button className="ic-action" onClick={() => this.props.uiActions.showNewNote()}>
                    <span className='ic-ctrl-key'>n</span>
                    <p>new note</p>
                </button>
                <button className="ic-action" onClick={this.props.uiActions.showDoodle}>
                    <span className='ic-ctrl-key'>d</span>
                    <p>new doodle</p>
                </button>
                <button className="ic-action" onClick={this.props.uiActions.toggleSidebar}>
                    <span className='ic-ctrl-key'>s</span>
                    <p>toggle sidebar</p>
                </button>
                <button className="ic-action" onClick={this.props.uiActions.toggleChat}>
                    <span className='ic-ctrl-key'>c</span>
                    <p>toggle chat</p>
                </button>
                <button className="ic-action" onClick={this.props.uiActions.toggleAbout}>
                    <span className='ic-ctrl-key'>p</span>
                    <p>toggle prompt</p>
                </button>
            </div>
        );
    }

    renderUserList() {
        let userList = _.map(this.props.users, this.renderUserColor.bind(this));
        return (
            <div className="ic-sidebar-list" name="users">
                <h2>Collaborators</h2>
                {userList}
            </div>
        );
    }

    renderConnectionStatus() {
        let connectionStatus = this.props.connected ?
            <p style={{color:COLORS.GREEN}}>connected</p> :
            <p style={{color:COLORS.RED}}>disconnected</p>;
        return (
            <div className="ic-sidebar-list" name="status">
                <h2>Status - {connectionStatus}</h2>
                <button name="logout" className="ic-action" onClick={this.logout}>
                    <i className="material-icons">lock</i>
                    <p>log out</p>
                </button>
            </div>
        );
    }

    save() {
        this.modal.prompt(MODALS.SAVE_BOOKMARK,(submit, bookmarkName) => {
            if (submit) {
                let username = this.props.you.replace(/\d+/g, '');
                Storage.addBookmark(bookmarkName, this.props.compass.editCode, username);
                this.toast.success(PROMPTS.SAVE_SUCCESS);
            }
        });
    }

    logout() {
        browserHistory.push('/');
    }

    renderActionList() {
        return (
            <div className="ic-sidebar-list" name="actions">
                <h2>Actions</h2>
                <button name="tutorial" className="ic-action"><Link to="/tutorial" target="_blank" rel="noopener noreferrer">
                    <i className="material-icons">info</i>
                    <p>tutorial</p>
                </Link></button>
                <button name="sucks" className="ic-action" onClick={this.props.uiActions.toggleFeedback}>
                    <i className="material-icons">chat_bubble</i>
                    <p>feedback</p>
                </button>
                <Timer stop={this.props.stop}/>
                <button name="destroyer" className="ic-action dangerous" onClick={this.confirmDelete}>
                    <i className="material-icons" style={{color:'white'}}>delete</i>
                    <p>delete</p>
                </button>
            </div>
        );
    }

    renderCreditsList() {
        return (
            <div className="ic-sidebar-list" name="credits">
                <h2>Credits</h2>
                <p name="ela">compass by
                    <Link to="http://innovatorscompass.org" target="_blank" rel="noopener noreferrer"> Ela Ben-Ur</Link>
                </p>
                <p name="hieu">app by
                    <Link href="http://hieuqn.com" target="_blank" rel="noopener noreferrer"> Hieu Nguyen</Link>
                </p>
            </div>
        );
    }

    renderVersionList() {
        return (
            <div className="ic-sidebar-list" name="version">
                <h2>iCompass {VERSION}</h2>
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
                <Swipeable onSwipedLeft={this.props.uiActions.toggleSidebar}>
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
                </Swipeable>
            </div>
        );
    }
}

Sidebar.propTypes = {
    connected: PropTypes.bool.isRequired,
    destroy: PropTypes.func.isRequired,
    exportCompass: PropTypes.func.isRequired,
    stop: PropTypes.func.isRequired,

    compass: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    you: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,

    uiActions: PropTypes.objectOf(PropTypes.func).isRequired,
};

function mapStateToProps(state) {
    return {
        users: state.users.nameToColor,
        you: state.users.me,
        show: state.ui.showSidebar,
        compass: state.compass
    };
}

function mapDispatchToProps(dispatch) {
    return {
        uiActions: bindActionCreators(uiActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);

