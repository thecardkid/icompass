import * as classnames from 'classnames';
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as uiX from '@actions/ui';
import { modal } from '@cypress/data_cy';

// Footers must have a submit action, and an optional secondary action.
// By default, we want to close modals on click, so it is simpler to
// accept button configuration as props and write our own click handlers,
// rather than providing and accepting <ModalButton> child components.
class ModalFooterComponent extends React.Component {
  onConfirm = () => {
    if (!this.props.confirmButton.keepOpenOnConfirm) {
      this.props.uiX.closeCurrentModal();
    }
    if (this.props.confirmButton.onConfirm) {
      this.props.confirmButton.onConfirm();
    }
  };

  onCancel = () => {
    this.props.uiX.closeCurrentModal();
    if (this.props.cancelButton && this.props.cancelButton.onCancel) {
      this.props.cancelButton.onCancel();
    }
  };

  render() {
    const confirmButton = this.props.confirmButton || {
      text: 'OK',
      isDangerous: false,
    };
    let cancelButtonElement;
    if (this.props.hasCancelButton) {
      const cancelButton = this.props.cancelButton || {
        text: 'Cancel',
      };
      cancelButtonElement = (
        <button id={'ic-modal-cancel'} onClick={this.onCancel}>{cancelButton.text}</button>
      );
    }

    return (
      <div className={'footer'}>
        <button id={'ic-modal-confirm'}
                data-cy={modal.confirmButton}
                className={classnames({ danger: confirmButton.isDangerous })}
                onClick={this.onConfirm}>{confirmButton.text}</button>
        {cancelButtonElement}
      </div>
    );
  }
}

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export const ModalFooter = connect(mapStateToProps, mapDispatchToProps)(ModalFooterComponent);
