import classnames from 'classnames';
import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as uiX from '@actions/ui';
import * as cypress from '@cypress/data_cy';

class DynamicModal extends Component {
  dontClose(e) {
    e.stopPropagation();
  }

  close = () => {
    if (this.props.disableDismiss) {
      return;
    }
    this.props.uiX.closeCurrentModal();
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  render() {
    if (this.props.modalName !== this.props.openModal) {
      return null;
    }

    const modal = (
      <div id={'ic-backdrop2'} onClick={this.close}>
        <div id={'ic-modal-scroller'}>
          <div className={classnames('ic-dynamic-modal', this.props.className)}
               onClick={this.dontClose}
               style={{ width: this.props.width || 400 }}
          >
            <div className={'contents'}>
              <div className={'header'} data-cy={cypress.modal.heading}>
                <h1 className={'title'}>{this.props.heading}</h1>
                {!this.props.disableDismiss &&
                <i onClick={this.close}
                   data-cy={cypress.modal.closeButton}
                   className={'material-icons'}>close</i>
                }
              </div>
              <div className={'body'}>
                {this.props.children}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    return ReactDOM.createPortal(modal, document.getElementById('ic-modal-container2'));
  }
}

const mapStateToProps = (state) => {
  return {
    openModal: state.ui.openModal,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DynamicModal);
