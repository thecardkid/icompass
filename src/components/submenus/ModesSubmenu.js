import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { EDITING_MODES } from '@utils/constants';
import MaybeTappable from '@utils/MaybeTappable';

import * as uiX from '@actions/ui';

import { workspaceMenu } from '@cypress/data_cy';

class ModesSubmenu extends Component {
  alertExplainModes = () => {
    this.props.uiX.openExplainViewModesModal();
    this.props.hideMenu();
  };

  render() {
    const { normal, compact } = this.props;

    return (
      <div className={'ic-menu ic-modes-submenu'}>
        <section className={'border-bottom'}>
          <MaybeTappable onTapOrClick={this.props.changeMode('standard')}>
            <div data-cy={workspaceMenu.modesSubactions.standard} id={'ic-standard'} className={'ic-menu-item'}>
              <span className={normal ? 'active' : 'inactive'} />
              Standard
              <span className={'ic-shortcut'}>shift+1</span>
            </div>
          </MaybeTappable>
          <MaybeTappable onTapOrClick={this.props.changeMode('compact')}>
            <div data-cy={workspaceMenu.modesSubactions.compact} id={'ic-compact'} className={'ic-menu-item'}>
              <span className={compact ? 'active' : 'inactive'} />
              Compact
              <span className={'ic-shortcut'}>shift+2</span>
            </div>
          </MaybeTappable>
        </section>
        <section>
          <div data-cy={workspaceMenu.modesSubactions.explain} className={'ic-menu-item'} onClick={this.alertExplainModes}>
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
    normal: state.ui.editingMode === EDITING_MODES.NORMAL || false,
    compact: state.ui.editingMode === EDITING_MODES.COMPACT || false,
    bulk: state.ui.editingMode === EDITING_MODES.VISUAL || false,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ModesSubmenu);
