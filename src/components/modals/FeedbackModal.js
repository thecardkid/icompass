import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import DynamicModal from './DynamicModal';
import * as uiX from '@actions/ui';
import getAPIClient from '@utils/api';
import { MODAL_NAME } from '@utils/constants';
import { ModalFooter } from './shared';

class FeedbackModal extends Component {

  submitFeedback = async () => {
    const email = this.refs.email.value;
    const note = this.refs.note.value;
    if (!note) {
      this.props.uiX.toastError('Please include some text in the note');
      return;
    }
    await getAPIClient().submitFeedback({
      submitterEmail: email,
      message: note,
    });
  };

  render() {
    return (
      <DynamicModal
        modalName={MODAL_NAME.FEEDBACK}
        className={'ic-feedback'}
        heading={'Leave your feedback'}
      >
          <div className={'explain'}>
            Have an idea for a new feature, or saw something go wrong that shouldn't have? Leave me a note, and I'll get back to you as soon as I can!
          </div>
          <textarea ref={'note'}
                    autoFocus
                    className={'feedback-note disable-shortcuts'} />
          <input placeholder={'Your email (optional)'}
                 type={'email'}
                 ref={'email'}
                 className={'disable-shortcuts'} />
          <ModalFooter confirmButton={{
            text: 'Send',
            onConfirm: this.submitFeedback,
          }} />
      </DynamicModal>
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

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackModal);
