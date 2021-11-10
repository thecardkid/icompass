import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as uiX from '@actions/ui';

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
      if (nextProps.toast.type === 'error') {
        timeoutMs = 6000;
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

    return (
      <div className={'ic-toast-container'}>
        <div className={cn}>
          <div className={'ic-toast-icon ' + this.classNameForType(toast.type)}>
            <i className={'material-icons'}>{this.iconForType(toast.type)}</i>
          </div>
          <div className={'ic-toast-message'}>
            {toast.message || this.message}
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
