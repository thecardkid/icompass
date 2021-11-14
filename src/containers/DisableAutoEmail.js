import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as uiX from '@actions/ui';
import Storage from '@utils/Storage';
import { DisableAutoEmailModal } from '@components/modals/ConfirmModalWithRedirect';

class DisableAutoEmail extends React.Component {
  componentDidMount() {
    this.props.uiX.openDisableAutoEmailModal();
    Storage.setAlwaysSendEmail(false);
  }

  render() {
    return <DisableAutoEmailModal redirectURL={'/'} />;
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

export default connect(mapStateToProps, mapDispatchToProps)(DisableAutoEmail);
