import React, { Component } from 'react';

import { HOST, TWEET } from '../../../lib/constants';
import ToastSingleton from '../../utils/Toast';
import DynamicModal from './DynamicModal';

export default class ShareModal extends Component {
  editLink = `${HOST}/compass/edit/${this.props.compass.editCode}`;
  viewLink = `${HOST}/compass/view/${this.props.compass.viewCode}`;
  toast = ToastSingleton.getInstance();

  copyEditLink = () => {
    const text = document.getElementById('ic-edit-link');
    text.select();
    document.execCommand('copy');
    this.toast.info('Edit link has been copied to clipboard');
  };

  copyViewLink = () => {
    const text = document.getElementById('ic-view-link');
    text.select();
    document.execCommand('copy');
    this.toast.info('View-only link has been copied to clipboard');
  };

  tweetThis = () => {
    const tweetURL = TWEET + this.props.compass.viewCode;
    window.open(tweetURL, '_blank').focus();
  };

  render() {
    return (
      <DynamicModal
        className={'ic-share'}
        heading={'Share this Workspace'}
        close={this.props.close}>
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
