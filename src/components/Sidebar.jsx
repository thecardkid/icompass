import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory, Link } from 'react-router';
import Swipeable from 'react-swipeable';
import { bindActionCreators } from 'redux';

import Modal from '../utils/Modal';
import SidebarActionsList from './SidebarActionsList.jsx';
import SidebarControlsList from './SidebarControlsList.jsx';
import SidebarShareList from './SidebarShareList.jsx';
import SidebarUsersList from './SidebarUsersList.jsx';
import Socket from '../utils/Socket';
import Toast from '../utils/Toast';

import * as uiX from '../actions/ui';
import * as workspaceX from '../actions/workspace';

import { VERSION, PROMPTS, PIXELS, COLORS } from '../../lib/constants';

class Sidebar extends Component {
  constructor(props, context) {
    super(props, context);
    this.toast = new Toast();
    this.modal = new Modal();
    this.socket = new Socket();

    this.socket.subscribe({
      'start timer': this.onStartTimer,
      'all cancel timer': this.onCancelTimer,
    });
  }

  onStartTimer = (min, sec, startTime) => {
    this.props.workspaceX.setTimer({ min, sec, startTime });
    this.toast.info(PROMPTS.TIMEBOX(min, sec));
  };

  onCancelTimer = () => {
    this.props.workspaceX.setTimer({});
    this.toast.info(PROMPTS.TIMEBOX_CANCELED);
  };

  shouldComponentUpdate(nextProps) {
    if (this.props.users !== nextProps.users)
      return true;

    if (this.props.users && this.props.users.length !== nextProps.users.length)
      return true;

    return (
      this.props.connected !== nextProps.connected ||
      this.props.show !== nextProps.show ||
      this.props.me !== nextProps.me
    );
  }

  renderConnectionStatus = () => {
    let connectionStatus = this.socket.isConnected() ?
      <p style={{ color: COLORS.GREEN }}>connected</p> :
      <p style={{ color: COLORS.RED }}>disconnected</p>;
    return (
      <div className="ic-sidebar-list" name="status">
        <h2>Status - {connectionStatus}</h2>
        <button name="logout" className="ic-action" onClick={this.logout}>
          <i className="material-icons">lock</i>
          <p>log out</p>
        </button>
      </div>
    );
  };

  logout() {
    browserHistory.push('/');
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
          <Link to="https://github.com/thecardkid/innovators-compass/releases" target="_blank"
                rel="noopener noreferrer">changelog</Link>
        </p>
      </div>
    );
  }

  render() {
    let style = { left: this.props.show ? PIXELS.SHOW : PIXELS.HIDE_SIDEBAR };
    const { toggleSidebar } = this.props.uiX;

    return (
      <div id="ic-sidebar" style={style}>
        <Swipeable onSwipedLeft={toggleSidebar}>
          <div id="ic-sidebar-scroll">
            <div id="ic-sidebar-contents">
              <button name="close-sidebar" className="ic-close-window" onClick={toggleSidebar}>x
              </button>
              <SidebarShareList compass={this.props.compass}
                                uiX={this.props.uiX}
                                me={this.props.me} />
              <SidebarControlsList uiX={this.props.uiX} />
              <SidebarUsersList users={this.props.users}
                                me={this.props.me} />
              {this.renderConnectionStatus()}
              <SidebarActionsList uiX={this.props.uiX}
                                  compass={this.props.compass}/>
              {this.renderCreditsList()}
              {this.renderVersionList()}
            </div>
          </div>
        </Swipeable>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    users: state.users.nameToColor,
    me: state.users.me,
    show: state.ui.showSidebar,
    compass: state.compass,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
    workspaceX: bindActionCreators(workspaceX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);

