import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ModalSingleton from '../utils/Modal';
import SocketSingleton from '../utils/Socket';

import * as uiX from '../actions/ui';

import { EDITING_MODE } from '../../lib/constants';

class ModesSubmenu extends Component {
  constructor() {
    super();
    this.modal = ModalSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
  }

  render() {
    const { normal, compact, bulk } = this.props;

    return (
      <div className={'ic-menu ic-modes-submenu'}>
        <section className={'border-bottom'}>
          <div id={'ic-standard'} className={'ic-menu-item'} onClick={this.props.changeMode('standard')}>
            <span className={normal ? 'active' : 'inactive'} />
            Standard
            <span className={'ic-shortcut'}>shift+1</span>
          </div>
          <div id={'ic-compact'} className={'ic-menu-item'} onClick={this.props.changeMode('compact')}>
            <span className={compact ? 'active' : 'inactive'} />
            Compact
            <span className={'ic-shortcut'}>shift+2</span>
          </div>
          <div id={'ic-bulk'} className={'ic-menu-item'} onClick={this.props.changeMode('bulk')}>
            <span className={bulk ? 'active' : 'inactive'} />
            Bulk Edit
            <span className={'ic-shortcut'}>shift+click</span>
          </div>
        </section>
        <section>
          <div className={'ic-menu-item'} onClick={this.modal.alertExplainModes}>
            <span className={'inactive'} />
            What are these?
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    normal: state.ui.editingMode === EDITING_MODE.NORMAL || false,
    compact: state.ui.editingMode === EDITING_MODE.COMPACT || false,
    bulk: state.ui.editingMode === EDITING_MODE.VISUAL || false,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ModesSubmenu);
