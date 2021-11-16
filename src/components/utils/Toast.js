import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as uiX from '@actions/ui';
import { isBrowserTestRunning } from '@utils/browser';
import { modal } from '@cypress/data_cy';

class Toast extends React.Component {
  toast = {
    type: 'success',
    message: '',
  };
  dismisserTimeoutID = null;

  componentWillUpdate(nextProps) {
    if (nextProps.toast.message) {
      // Hacky way to avoid the toast "emptying out" when being dismissed.
      this.toast = nextProps.toast;
      // If another toast appears, refresh the timer;
      if (this.dismisserTimeoutID) {
        clearTimeout(this.dismisserTimeoutID);
      }
      let timeoutMs = 3000;
      if (nextProps.toast.type === 'error'
        || nextProps.toast.message === uiX.specialToasts.automaticEmail) {
        timeoutMs = 6000;
      }
      if (isBrowserTestRunning()) {
        // Machines are slow.
        timeoutMs *= 1.5;
      }
      this.dismisserTimeoutID = setTimeout(this.props.uiX.toastClear, timeoutMs);
    }
  }

  classNameForType(t) {
    switch (t) {
      case 'info':
        return 'ic-toast-info';
      case 'success':
        return 'ic-toast-success';
      case 'error':
        return 'ic-toast-error';
      default:
        return 'ic-toast-unknown';
    }
  }

  iconForType(t) {
    switch (t) {
      case 'info':
        return 'notifications';
      case 'success':
        return 'done';
      case 'error':
        return 'report_problem';
      default:
        return '';
    }
  }

  handleDismiss = () => {
    this.props.uiX.toastClear();
  };

  openAutoEmailFeatureModal = () => {
    this.props.uiX.openAutoEmailFeatureModal();
  };

  render() {
    let { toast } = this.props;

    let cn = 'ic-toast';
    if (!this.props.toast.message) {
      // Hide the toast
      cn += ' hidden';
      // Use previously saved data, show that the toast doesn't "empty out"
      // during its dismissed animation.
      toast = this.toast;
    }
    let message = toast.message || this.message;
    if (toast.message === uiX.specialToasts.automaticEmail) {
      let text;
      if (toast.type === 'success') {
        text = `A link to this workspace has automatically been sent to ${toast.recipientEmail}`;
      } else if (toast.type === 'error') {
        text = 'Failed sending email, please note down your workspace code somewhere.';
      }
      message = this.message = (
        <span className={'auto-email'}>{text}.<u data-cy={modal.whatsThis} onClick={this.openAutoEmailFeatureModal}>What's this?</u>
        </span>
      );
    }

    return (
      <div className={'ic-toast-container'}>
        <div className={cn}>
          <div className={'ic-toast-icon ' + this.classNameForType(toast.type)}>
            <i className={'material-icons'}>{this.iconForType(toast.type)}</i>
          </div>
          <div className={'ic-toast-message'}>
            {message}
          </div>
          <div className={'ic-toast-close'} onClick={this.handleDismiss}>
            <i className={'material-icons'}>close</i>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    toast: state.ui.toast,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Toast);
