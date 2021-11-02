import React, { Component } from 'react';

import DynamicModal from './DynamicModal';
import { submitFeedback } from '@utils/api';
import ToastSingleton from '@utils/Toast';

export default class FeedbackModal extends Component {
  toast = ToastSingleton.getInstance();

  submitFeedback = async () => {
    const email = this.refs.email.value;
    const note = this.refs.note.value;
    if (!note) {
      this.toast.warn('Please include some text in the note');
      return;
    }
    await submitFeedback({
      submitterEmail: email,
      message: note,
    });
    this.props.close();
  };

  render() {
    return (
      <DynamicModal
        className={'ic-feedback'}
        close={this.props.close}
        heading={'I\'d love to hear from you'}>
          <div className={'explain'}>
            Have an idea for a new feature? Or saw something go wrong that shouldn't have? Leave me a note, and I'll get back to you as soon as I can!
          </div>
          <input placeholder={'Your email (optional)'}
                 type={'email'}
                 ref={'email'}
                 autoFocus
                 className={'feedback-email disable-shortcuts'} />
          <textarea placeholder={'Your note...'}
                    ref={'note'}
                    className={'feedback-note disable-shortcuts'} />
          <div className={'send'}>
            <button onClick={this.submitFeedback}>Send</button>
          </div>
      </DynamicModal>
    );
  }
}
