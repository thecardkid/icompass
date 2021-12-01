import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as uiX from '@actions/ui';
import { modal } from '@cypress/data_cy';

export const messages = {
  mobileNoMultiEdit: 'Multi-edit mode is not available for mobile devices',
  multiEditNoDrafts: 'Cannot edit drafts with multi-edit mode',
  multiEditNoSingleEdit: "Can't make changes to individual notes while in multi-edit mode",
};

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
      const { type, message } = nextProps.toast;
      if (type === uiX.specialToasts.emailReminder) {
        return;
      }
      let timeoutMs = 10000;
      if (type === 'error'
        || message === uiX.specialToasts.automaticEmail) {
        timeoutMs = 20000;
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
    this.props.uiX.toastClear();
    this.props.uiX.openAutoEmailFeatureModal();
  };

  openEmailReminderModal = () => {
    this.props.uiX.toastClear();
    this.props.uiX.openEmailWorkspaceModal();
  };

  openDisableEmailReminderModal = () => {
    this.props.uiX.toastClear();
    this.props.uiX.openDisableEmailReminderModal();
  }

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
    let message = toast.message;
    switch (toast.message) {
      case uiX.specialToasts.automaticEmail:
        let text;
        if (toast.type === 'success') {
          text = `A link to this workspace has automatically been sent to ${toast.recipientEmail}.`;
        } else if (toast.type === 'error') {
          text = 'Failed sending email, please note down your workspace code somewhere.';
        }
        message = (
          <span className={'auto-email'}>{text}<u data-cy={modal.whatsThis} onClick={this.openAutoEmailFeatureModal}>What's this?</u>
          </span>
        );
        break;
      case uiX.specialToasts.emailReminder:
        message = (
          <div className={'email-reminder'}>
            <span>
              Email yourself a link to this workspace.
              <u data-cy={modal.emailReminderGo} onClick={this.openEmailReminderModal}>Go</u>
              <u data-cy={modal.emailReminderDisable} onClick={this.openDisableEmailReminderModal}>Don't show this again</u>
            </span>
          </div>
        );
        break;
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
