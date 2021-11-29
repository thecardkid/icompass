/* eslint-disable quotes */

import { connect } from 'react-redux';
import * as React from 'react';
import { bindActionCreators } from 'redux';

import DynamicModal from './DynamicModal';
import { ModalFooter } from './shared';
import * as uiX from '@actions/ui';
import { MODAL_NAME } from '@utils/constants';

export function Prompt(dynamicModalProps, paragraphs) {
  const x = class X extends React.Component {
    constructor(props) {
      super(props);
      this.state = { value: this.props.defaultValue || '' };
    }

    onSubmit = () => {
      const { value } = this.state;
      if (value === '') {
        return;
      }
      if (this.props.validateFn) {
        const err = this.props.validateFn(value);
        if (err) {
          this.error(err);
          return;
        }
      }
      this.props.uiX.closeAllModals();
      this.props.onSubmit(value);
    };

    setValue = (e) => {
      this.setState({ value: e.target.value });
    };

    error = (msg) => {
      this.props.uiX.toastError(msg);
    };

    render() {
      return (
        <DynamicModal {...dynamicModalProps}>
          {paragraphs.map((text, i) => <p dangerouslySetInnerHTML={{__html: text}} key={i} />)}
          <input id={'ic-modal-input'}
                 value={this.state.value}
                 autoFocus={true}
                 spellCheck={false}
                 onFocus={(e)=> {
                   // A hack to make the cursor come after the default text, instead of before.
                   e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
                 }}
                 onChange={this.setValue} />
          {this.props.children}
          <ModalFooter confirmButton={{
            text: 'Submit',
            onConfirm: this.onSubmit,
            keepOpenOnConfirm: true,
          }} />
        </DynamicModal>
      );
    }
  };
  const mapStateToProps = (state) => {
    return {
      ui: state.ui,
    };
  };

  const mapDispatchToProps = (dispatch) => {
    return {
      uiX: bindActionCreators(uiX, dispatch),
    };
  };

  return connect(mapStateToProps, mapDispatchToProps)(x);
}

export const EditBookmarkPrompt = Prompt({
  modalName: MODAL_NAME.EDIT_BOOKMARK,
  heading: 'Edit bookmark',
}, [
  'Enter a new name for your bookmark:'
]);

export const EmailBookmarksPrompt = Prompt({
  modalName: MODAL_NAME.EMAIL_BOOKMARKS,
  heading: 'Email your bookmarks',
}, [
  'Enter your email below to receive all links to your bookmarked workspaces.',
  'The app will not store your email address, or send you spam.',
]);

export const BookmarkWorkspacePrompt = Prompt({
  modalName: MODAL_NAME.BOOKMARK_WORKSPACE,
  heading: 'Bookmark',
}, [
  `Bookmarks give you quick access to workspaces from the app's home page - but can be lost if your browser cache is erased.`,
  'To never lose access to your compass, email yourself a link, or copy and paste it somewhere secure.'
]);

export const EmailWorkspacePrompt = Prompt({
  modalName: MODAL_NAME.EMAIL_WORKSPACE,
  heading: 'Receive a link to this workspace',
}, [
  `You'll need the link to the compass to access it again. To email yourself the link now, enter your email address below.`,
  'The app will not store your email address or send you spam.',
]);

export const PeopleGroupsPrompt = Prompt({
  modalName: MODAL_NAME.PEOPLE_GROUPS,
  heading: `1. Who's involved, including you?`,
  disableDismiss: true,
}, [
  `<p>For and with everyone involved, explore...</p>`,
]);

export const PeopleGroupsDismissablePrompt = Prompt({
  modalName: MODAL_NAME.PEOPLE_GROUPS_DISMISSABLE,
  heading: `1. Who's involved, including you?`,
}, [
  `<p>For and with everyone involved, explore...</p>`,
]);

export const UsernamePrompt = Prompt({
  modalName: MODAL_NAME.USERNAME,
  heading: 'Welcome to this workspace!',
  disableDismiss: true,
}, [
  '<p>Please enter your name as it will appear to others:',
]);

export const TopicPrompt = Prompt({
  modalName: MODAL_NAME.TOPIC,
  heading: 'Edit workspace topic',
}, [
  'What are you working on:',
]);
