import React, { Component } from 'react';

import { HOST, TWEET } from '../../../lib/constants';
import ToastSingleton from '../../utils/Toast';
import SocketSingleton from '../../utils/Socket';
import DynamicModal from './DynamicModal';

export default class ShareModal extends Component {
  editLink = `${HOST}/compass/edit/${this.props.compass.editCode}`;
  viewLink = `${HOST}/compass/view/${this.props.compass.viewCode}`;
  toast = ToastSingleton.getInstance();
  socket = SocketSingleton.getInstance();

  constructor(props) {
    super(props);

    this.socket.subscribe({
      'copy of compass ready': (data) => {
        if (!data.success) {
          this.toast.error('There was a problem creating a copy of your workspace. Please report this error.');
        }
        window.open(`/compass/edit/${data.editCode}`, '_blank');
      },
    });
  }

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

  makeACopyOfWorkspace = () => {
    this.socket.emitCreateCopyOfWorkspace(this.props.compass.editCode);
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
        <div className={'share-copy'}>
          <h2>Make a Copy</h2>
          <p className={'make-a-copy-explanation'}>This will open a new tab with a workspace that is a copy of your current workspace. All changes made to the copy will not reflect on the original, and the copy can be shared independently of the original.</p>
          <div className={'actions'}>
            <button name={'make-copy'} onClick={this.makeACopyOfWorkspace}>Create Copy</button>
          </div>
        </div>
      </DynamicModal>
    );
  }
}
