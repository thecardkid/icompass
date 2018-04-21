import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ModalSingleton from '../utils/Modal';
import SocketSingleton from '../utils/Socket';

import * as uiX from '../actions/ui';

import { MODALS, EDITING_MODE } from '../../lib/constants';

class ModesSubmenu extends Component {
  constructor() {
    super();
    this.modal = ModalSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
  }

  changeMode = (mode) => {
    switch (mode) {
      case 'ic-standard':
        this.socket.emitMetric('menu normal mode');
        return this.props.uiX.normalMode();

      case 'ic-compact':
        this.socket.emitMetric('menu compact mode');
        return this.props.uiX.compactMode();

      case 'ic-bulk':
        this.socket.emitMetric('menu visual mode');
        return this.props.uiX.visualMode(this.props.notes.length);

      case 'ic-draft':
        this.socket.emitMetric('menu draft mode');
        return this.props.uiX.draftMode();

      default:
        return;
    }
  };

  handleChangeMode = (e) => {
    const { id } = e.target;
    if (this.props.modes.draft && id !== 'ic-draft' && this.props.hasDrafts) {
      this.modal.confirm(MODALS.EXIT_DRAFT_MODE, (confirmed) => {
        if (confirmed) this.changeMode(id);
      });
    } else {
      this.changeMode(id);
    }
  };

  render() {
    const { normal, compact, bulk, draft } = this.props.modes;

    return (
      <div className={'ic-menu ic-modes-submenu'}>
        <section className={'border-bottom'}>
          <div id={'ic-standard'} className={'ic-menu-item'} onClick={this.handleChangeMode}>
            <span className={normal ? 'active' : 'inactive'} />
            Standard
            <span className={'ic-shortcut'}>⇧1</span>
          </div>
          <div id={'ic-compact'} className={'ic-menu-item'} onClick={this.handleChangeMode}>
            <span className={compact ? 'active' : 'inactive'} />
            Compact
            <span className={'ic-shortcut'}>⇧2</span>
          </div>
          <div id={'ic-draft'} className={'ic-menu-item'} onClick={this.handleChangeMode}>
            <span className={draft ? 'active' : 'inactive'} />
            Draft
            <span className={'ic-shortcut'}>⇧3</span>
          </div>
          <div id={'ic-bulk'} className={'ic-menu-item'} onClick={this.handleChangeMode}>
            <span className={bulk ? 'active' : 'inactive'} />
            Bulk Edit
            <span className={'ic-shortcut'}>⇧4</span>
          </div>
        </section>
        <section>
          <div className={'ic-menu-item'}>
            What are these?
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    notes: state.notes,
    ui: state.ui,
    modes: {
      normal: state.ui.editingMode === EDITING_MODE.NORMAL || false,
      compact: state.ui.editingMode === EDITING_MODE.COMPACT || false,
      bulk: state.ui.editingMode === EDITING_MODE.VISUAL || false,
      draft: state.ui.editingMode === EDITING_MODE.DRAFT || false,
    },
    hasDrafts: (state.workspace.drafts || []).length > 0,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ModesSubmenu);
