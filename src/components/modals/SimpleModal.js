/* eslint-disable quotes */

import * as React from 'react';

import { MODAL_NAME } from '@utils/constants';
import DynamicModal from './DynamicModal';

// Simple = no redux & callbacks.
function SimpleModal(dynamicModalProps, paragraphs) {
  return class X extends React.Component {
    render() {
      return (
        <DynamicModal {...dynamicModalProps}>
          {paragraphs.map((text, i) => <p dangerouslySetInnerHTML={{__html: text}} key={i} />)}
        </DynamicModal>
      );
    }
  };
}

export const AboutUsModal = SimpleModal({
  modalName: MODAL_NAME.ABOUT_US,
  heading: 'Hi!',
}, [
  `Ela Ben-Urs mission is making powerful ways forward accessible for any person and moment. She distilled Innovators' Compass from Design Thinking and other practices over a 20-year journey through IDEO, MIT and Olin - and continues to evolve it in collaboration with people around the world, from parents to educators to organizational leaders. More tools and many examples are at <a href="https://innovatorscompass.org"><u>innovatorscompass.org</u></a>.`,
  `My name is Hieu Nguyen, and I am the creator of this app. I am an Olin graduate, class of 2018. Having worked with this design framework from classes with Ela, I saw the potential in an online collaborative Compass and made it a reality.`,
  `We offer this app for free so you can move forward with it in challenges big or small. So please:`,
  `1. Use and share this!<br/>2. Share back experiences by <a href="mailto:ela@innovatorscompass.org"><u>email</u></a> or <a href="https://twitter.com" target="_blank"><u>Twitter</u></a>.`,
  `To changing the world for free,`,
  'Ela & Hieu',
]);

export const PrivacyStatementModal = SimpleModal({
  modalName: MODAL_NAME.PRIVACY_STATEMENT,
  heading: 'Privacy statement',
}, [
  'iCompass does not require any personally-identifiable information about you. Where privacy is a concern, consider having collaborators not include their real/entire names or other personally-identifiable information in their screen names or Compass.',
  'If you choose to "save via email", your email is only used to send you your workspace code at that time, and is not stored. If you enable the "always send email" feature, your email is remembered using storage on your device, and is not stored on the server.',
  `iCompass stores data pertaining to your workspace in a secure manner, in order to provide you reliable access. iCompass will not expose your workspace's contents, code, or any other information, to any third-party for reasons other than storage.`,
  `Anyone who has your workspace's edit code will be able to access and modify any and all data in your Compass. Save and share your workspace link with care, and ask collaborators to do the same.`,
]);

export const WhatsNewModal = SimpleModal({
  modalName: MODAL_NAME.WHATS_NEW,
  heading: 'New things',
}, [
  '● New look for notifications!<br />● Cleaner and more consistently formatted modals.',
]);

export const ExplainViewModesModal = SimpleModal({
  modalName: MODAL_NAME.EXPLAIN_VIEW_MODES,
  heading: 'What are these modes?',
}, [
  '<b>Standard mode</b> is what you are in by default.',
  '<b>Compact mode</b> make notes take up much less space - it is meant for smaller devices.',
  '<b>Multi-Edit</b> mode lets you edit multiple notes at once. Hold down Shift and click on any note to enter this mode.',
]);

