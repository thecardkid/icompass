/* global icompass */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import DynamicModal from './DynamicModal';
import * as uiX from '@actions/ui';
import { MODAL_NAME, makeTwitterURL } from '@utils/constants';

class ShareModal extends Component {
  editLink = `${icompass.config.APP_HOST}/compass/edit/${this.props.compass.editCode}`;
  viewLink = `${icompass.config.APP_HOST}/compass/view/${this.props.compass.viewCode}`;

  copyEditLink = () => {
    const text = document.getElementById('ic-edit-link');
    text.select();
    document.execCommand('copy');
    this.props.uiX.toastInfo('Edit link has been copied to clipboard');
  };

  copyViewLink = () => {
    const text = document.getElementById('ic-view-link');
    text.select();
    document.execCommand('copy');
    this.props.uiX.toastInfo('View-only link has been copied to clipboard');
  };

  tweetThis = () => {
    window.open(makeTwitterURL(this.props.compass.viewCode), '_blank').focus();
  };

  render() {
    return (
      <DynamicModal
        modalName={MODAL_NAME.SHARE_WORKSPACE}
        className={'ic-share'}
        heading={'Share this workspace'}
      >
        <div className={'ic-share-link'}>
          <p>Anyone can <b>edit</b></p>
          <div className={'share-box'}>
            <input id={'ic-edit-link'} value={this.editLink} readOnly={true} />
            <button className={'copy-edit'} onClick={this.copyEditLink}>Copy</button>
          </div>
        </div>
        <div className={'ic-share-link'}>
          <p>Anyone can <b>view</b></p>
          <div className={'share-box'}>
            <input id={'ic-view-link'} value={this.viewLink} readOnly={true} />
            <button className={'copy-view'} onClick={this.copyViewLink}>Copy</button>
          </div>
        </div>
        <div className={'actions'}>
          <button onClick={this.tweetThis}>Share on Twitter</button>
        </div>
      </DynamicModal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    compass: state.compass,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShareModal);
