/* eslint-disable quotes */

import * as React from 'react';

import { MODAL_NAME } from '@utils/constants';
import DynamicModal from './DynamicModal';
import { ModalFooter } from './shared';

function ConfirmDeleteModal(dynamicModalProps, paragraphs) {
  return class X extends React.Component {
    render() {
      const {
        onConfirm,
      } = this.props;
      return (
        <DynamicModal {...dynamicModalProps}>
          {paragraphs.map((text, i) => <p dangerouslySetInnerHTML={{__html: text}} key={i} />)}
          <ModalFooter confirmButton={{
            text: 'Delete',
            isDangerous: true,
            onConfirm,
          }}/>
        </DynamicModal>
      );
    }
  };
}

export const DeleteBookmarkModal = ConfirmDeleteModal({
  modalName: MODAL_NAME.DELETE_BOOKMARK,
  heading: 'Are you sure?',
}, [
  'You are about to remove this bookmark.',
]);

export const DeleteNoteModal = ConfirmDeleteModal({
  modalName: MODAL_NAME.DELETE_NOTE,
  heading: 'Are you sure?',
}, [
  'You are about to delete this note. This action cannot be undone.',
]);

export const DeleteNotesModal = ConfirmDeleteModal({
  modalName: MODAL_NAME.DELETE_NOTES,
  heading: 'Are you sure?',
}, [
  'You are about to delete all selected notes. This action cannot be undone.',
]);

export const DeleteDraftModal = ConfirmDeleteModal({
  modalName: MODAL_NAME.DELETE_DRAFT,
  heading: 'Are you sure?',
}, [
  'You are about to discard this draft. This action cannot be undone.',
]);

export const DeleteWorkspaceModal = ConfirmDeleteModal({
  modalName: MODAL_NAME.DELETE_WORKSPACE,
  heading: 'Are you sure?',
}, [
  'You are about to delete this workspace. This action cannot be undone.',
]);

