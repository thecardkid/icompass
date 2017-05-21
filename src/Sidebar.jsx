'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import { PROMPTS, CONTROLS, PIXELS, COLORS } from '../utils/constants.js';

export default class Sidebar extends Component {

    constructor(props, context) {
        super(props, context);
        this.controlList = _.map(CONTROLS, this.renderControl);
        this.showSavePrompt = this.showSavePrompt.bind(this);
        this.exportCompass = this.exportCompass.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
    }

    shouldComponentUpdate(nextProps) {
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

    notifyMe() {
        alert(PROMPTS.THIS_SUCKS);
    }

    showSavePrompt() {
        if (confirm(PROMPTS.EXPORT)) this.exportCompass();
    }

    exportCompass() {
        this.setState({showSidebar: false, showChat: false}, () => {
            window.html2canvas(document.body).then((canvas) => {
                let imgData = canvas.toDataURL('image/png');
                let doc = new jsPDF('l', 'cm', 'a4');
                doc.addImage(imgData, 'PNG', 0, 0, 30, 18);
                doc.save('compass.pdf');
            });
        });
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
                        <p><span name="edit-code" className="code">{this.props.editCode}</span> edit</p>
                        <p><span name="view-code" className="code">{this.props.viewCode}</span> view</p>
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
                        <button className="ic-action" onClick={this.showSavePrompt}>Export to PDF</button>
                        <button name="sucks" className="ic-action" onClick={this.notifyMe}>This sucks</button>
                        <button name="tutorial" className="ic-action"><a href="/tutorial" target="_blank" rel="noopener noreferrer">Tutorial</a></button>
                        <button name="destroyer" className="ic-action dangerous" onClick={this.confirmDelete}>Delete Compass</button>
                    </div>
                    <div className="ic-sidebar-list">
                        <h2>Credits</h2>
                        <p>Compass by
                            <a href="http://innovatorscompass.org" target="_blank" rel="noopener noreferrer"> Ela Ben-Ur</a>
                        </p>
                        <p>App by
                            <a href="http://hieuqn.com" target="_blank" rel="noopener noreferrer"> Hieu Nguyen</a>
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
    toggleSidebar: PropTypes.func.isRequired
};

