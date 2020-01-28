import $ from 'jquery';
import ReactGA from 'react-ga';
import { browserHistory } from 'react-router';
import _ from 'underscore';

import { TWEET } from '../../lib/constants';

const ModalSingleton = (() => {
  class Modal {
    constructor() {
      this.show = false;
    }

    addBackdropIfNecessary() {
      if ($('#ic-backdrop').length === 0) {
        $('#ic-modal-container').append('<div id="ic-backdrop"></div>');
      }
    }

    image({ src, background }) {
      let style = '';
      if (background) {
        style += `style="background:${background}"`;
      }

      const html = `
        <div id="ic-modal-image" ${style}>
          <img src="${src}" />
        </div>
      `;

      this.renderModal(html);
      this.onEvent({});
    }

    getModalHtml(body, confirm, cancel = '') {
      return (`
        <div id="ic-modal">
          <div id="ic-modal-body">${body}</div>
          <div id="ic-modal-footer">
            ${confirm}
            ${cancel}
          </div>
        </div>
      `);
    }

    renderModal(html) {
      const $container = $('#ic-modal-container');
      $container.empty().append(html);
      let $backdrop = $('#ic-backdrop');
      if ($backdrop.length === 0) {
        $container.append('<div id="ic-backdrop"></div>');
      }
    }

    onEvent({
      onConfirm = _.noop,
      onCancel =_.noop,
      onBackdrop = _.noop,
    }) {
      this.show = true;

      $('#ic-modal-confirm').on('click', () => {
        this.close();
        onConfirm();
      });
      $('#ic-modal-cancel').on('click', () => {
        this.close();
        onCancel();
      });
      $('#ic-backdrop').on('click', () => {
        this.close();
        onBackdrop();
      });
    }

    confirm({
      heading = 'Are you sure?',
      body = '',
      confirmText = 'OK',
      cancelText = 'Cancel',
      isDangerous = true,
      cb = _.noop,
    }) {
      let bodyHtml = `<h3>${heading}</h3>`;

      if (typeof body === 'string') {
        bodyHtml += `<p>${body}</p>`;
      } else if (body.length > 0) {
        _.each(body, p => bodyHtml += `<p>${p}</p>`);
      }

      const html = this.getModalHtml(
        bodyHtml,
        `<button id="ic-modal-confirm" class="${isDangerous ? 'danger': 'confirm'}">${confirmText}</button>`,
        `<button id="ic-modal-cancel">${cancelText}</button>`,
      );

      this.renderModal(html);

      this.onEvent({
        onConfirm: () => cb(true),
        onCancel: () => cb(false),
        onBackdrop: () => cb(false),
      });
    }

    generateAlert(text) {
      return this.getModalHtml(
        text,
        '<button id="ic-modal-confirm">Got it</button>',
      );
    }

    alert({
      heading = '',
      body = '',
      cb = _.noop,
    }) {
      let html = `<h3>${heading}</h3>`;

      if (typeof body === 'string') {
        html += `<p>${body}</p>`;
      } else if (body.length > 0) {
        _.each(body, p => html += `<p>${p}</p>`);
      }

      this.renderModal(this.generateAlert(html));
      this.onEvent({
        onConfirm: cb,
        onCancel: _.noop,
        onBackdrop: cb,
      });
    }

    alertPrivacyStatement = () => {
      ReactGA.modalview('modals/privacy-statement');
      this.alert({
        heading: 'Privacy Statement',
        body: [
          'iCompass does not require any personally-identifiable information about you. Where privacy is a concern, consider having collaborators not include their real/entire names or other personally-identifiable information in their screen names or Compass.',
          'If you choose to "save via email", your email is only used to send you your workspace code at that time, and is not stored.',
          'iCompass stores data pertaining to your workspace in a secure manner, in order to provide you reliable access. iCompass will not expose your workspace\'s contents, code, or any other information, to any third-party for reasons other than storage.',
          'Anyone who has your workspace\'s edit code will be able to access and modify any and all data in your Compass. Save and share your workspace link with care, and ask collaborators to do the same.',
        ],
      });
    };

    alertFeedback = (code) => {
      ReactGA.modalview('modals/feedback');
      this.alert({
        heading: 'We\'d love to hear from you!',
        body: [
          `It's a huge help to us if you reach out with your experiences and questions! Please email
          <a href="mailto:hieumaster95@gmail.com"><u>Hieu</u></a> (app creator) or 
          <a href="mailto:ela@innovatorscompass.org"><u>Ela</u></a> (Compass creator).
          Or <a href="${TWEET + code}"><u>tweet</u></a>!`,
          `To report a bug or request a feature, please go
          <a href="https://github.com/thecardkid/innovators-compass/issues" target="_blank" rel="noopener noreferrer"><u>here</u></a>
          and click New issue.`,
          `If you are reporting a bug, please list the steps to reproduce or include screenshots.
          If requesting a new feature, please be specific!`,
        ],
      });
    };

    alertCompassPrompt = () => {
      ReactGA.modalview('modals/prompt');
      this.alert({
        heading: 'The Innovator\'s Compass',
        body: [
          'Starting something or feeling stuck? Use five powerful questions to make things better.',
          '<h4>Tips for each question:</h4>',
          '<b>1. PEOPLE: Who could be involved?</b> ...including you? For and with everyone involved, explore...',
          '<b>2. OBSERVATIONS: What\'s happening? Why?</b> Details and all sides of what people are doing, saying, thinking, and feeling.',
          '<b>3. PRINCIPLES: What matters most for everyone involved?</b> Different, maybe competing things here. That\'s the challenge!',
          '<b>4. IDEAS: What ways are there?</b> Different who/what/when/where/hows. Anyone and anything can help. Look around for ideas!',
          '<b>5. EXPERIMENTS: What\'s a step to try?</b> Small, with real details so you DO it! What happens? (back to #2)</b>',
          'Really explore. Look, listen, feel; use words, draw, move, or make. In this order or any way they you forward. Guesses are fine—just add ? marks and go find out!',

          '<h4>Tips for organizing</h4>',
          'Cluster related stickies together and add a label with a sticky that stands out—e.g. in bold capitals, and/or a different color.',

          '<h4>Tips for groups</h4>',
          'Divide up the time you have to work on each part. For each part of the compass...',
          '1. Give everyone a little quiet time to write their own stickies as drafts, one thought per sticky.  If they have thoughts about other parts, they can draft those too.',
          '2. One person publishes one sticky, and reads out just what it says.',
          '3. Others publish any similar notes they have, clustering them around the first',
          '4. Then someone else publishes and reads a different note to start a new cluster, and so on',
          'For more information, visit <a href="http://innovatorscompass.org" target="_blank"><u>innovatorscompass.org</u></a>.',
        ],
      });
    };

    alertExplainModes = () => {
      ReactGA.modalview('modals/explain-modes');
      this.alert({
        heading: 'What are these modes?',
        body: [
          '<b>Standard mode</b> is what you are in by default',
          '<b>Compact mode</b> make notes take up much less space - it is meant for smaller devices.',
          '<b>Bulk Edit</b> mode allows you to edit notes in bulk! Hold down Shift and click on any note to enter this mode.',
        ],
      });
    };

    alertAboutUs = () => {
      ReactGA.modalview('modals/about-us');
      this.alert({
        heading: 'Hi!',
        body: [
          'Ela Ben-Ur\'s mission is making powerful ways forward accessible for any person and moment. She distilled Innovators\' Compass from Design Thinking and other practices over a 20-year journey through IDEO, MIT and Olin - and continues to evolve it in collaboration with people around the world, from parents to educators to organizational leaders. More tools and many examples are at <a href="innovatorscompass.org"><u>innovatorscompass.org</u></a>.',
          'My name is Hieu Nguyen, and I am the creator of this app. I am an Olin graduate, class of 2018. Having worked with this design framework from classes with Ela, I saw the potential in an online collaborative Compass and made it a reality.',
          'We offer this app for free so you can move forward with it in challenges big or small. So please:',
          `1. Use and share this!<br/>2. Share back experiences by <a href="mailto:ela@innovatorscompass.org"><u>email</u></a> or <a href="${TWEET}" target="_blank"><u>tweet</u></a>.`,
          'To changing the world for free,',
          'Hieu & Ela',
        ],
      });
    };

    alertRouteErrors(validCode, validUsername, code) {
      if (!validCode) {
        return this.alert({
          heading: 'Your code is not valid',
          body: 'You will be redirected to the login page.',
          cb: () => browserHistory.push('/'),
        });
      }
      if (!validUsername) {
        return this.alert({
          heading: 'Your username is invalid',
          body: [
            'Username can only contain letters, and must not be longer than 15 characters',
            'Click "Got it" to pick a new username',
          ],
          cb: () => browserHistory.push(`/compass/edit/${code}`),
        });
      }
    }

    generatePrompt(html) {
      return this.getModalHtml(
        `${html}<input id="ic-modal-input"/>`,
        '<button id="ic-modal-confirm">Submit</button>',
        '<button id="ic-modal-cancel">Cancel</button>',
      );
    }

    promptForEmail(confirmCb, alwaysSendEmailCb,) {
      let html = `
        <h3>Receive a Link to this Workspace</h3>
        <p>
          You'll need the link to the compass to access it again. To email yourself the link now,
          enter your email address below.
          <br/><br/>
          I will not store your email address or send you spam.
        </p>
        <input id="ic-modal-input" placeholder="enter email or leave blank">
        <div class="ic-always">
          <input type="checkbox" id="ic-always-email-value" /> 
          <span>Always send me the link to workspaces I create</span>
        </div>
      `;

      html = this.getModalHtml(
        html,
        '<button id="ic-modal-confirm">Submit</button>',
        '<button id="ic-modal-cancel">Skip</button>',
      );

      this._prompt(html, confirmCb);

      $('#ic-always-email-value').on('change', (ev) => {
        alwaysSendEmailCb(ev.target.checked);
      });
    }

    promptForCenter(warnFunc, cb) {
      const html = this.getModalHtml(
        `<h3>1. Who\'s involved, including you?</h3>
         <input id="ic-modal-input" />
         <p>For and with everyone involved, explore...</p>`,
        '<button id="ic-modal-confirm">Submit</button>',
      );
      $('#ic-modal-container').empty().append(html);
      $('#ic-modal-input').focus();
      if (__DEV__) {
        $('#ic-modal-input').val('involved-autofilled').select();
      }
      this.addBackdropIfNecessary();
      this.show = true;

      let response;
      $('#ic-modal-confirm').on('click', () => {
        response = $('#ic-modal-input').val();
        if (!response) {
          warnFunc('You can\'t leave this empty');
        } else {
          this.close();
          cb(response);
        }
      });
      $('#ic-modal-cancel').on('click', () => warnFunc('You need to complete this action'));
      $('#ic-backdrop').on('click', () => warnFunc('You need to complete this action'));
    }

    editCenter(currentVal, cb) {
      ReactGA.modalview('modals/edit-center');
      const html = this.getModalHtml(
        `<h3>1. Who\'s involved, including you?</h3>
         <input id="ic-modal-input"/>
         <p>For and with everyone involved, explore...</p>`,
        '<button id="ic-modal-confirm">Submit</button>',
        '<button id="ic-modal-cancel">Cancel</button>',
      );

      $('#ic-modal-container').empty().append(html);
      $('#ic-modal-input').val(currentVal).select();
      this.addBackdropIfNecessary();
      this.show = true;

      $('#ic-modal-confirm').on('click', () => {
        const value = $('#ic-modal-input').val();
        cb(value);
        this.close();
      });
      $('#ic-modal-cancel').on('click', () => {
        this.close();
        cb(null);
      });
      $('#ic-backdrop').on('click', () => {
        this.close();
        cb(null);
      });
    }

    promptForUsername(warn, cb) {
      ReactGA.modalview('modals/prompt-username');
      const html = '<h3>Welcome to this workspace!</h3><p>Please enter your name as it would appear to others:</p>';
      $('#ic-modal-container').empty().append(this.generatePrompt(html));
      $('#ic-modal-input').focus();
      this.addBackdropIfNecessary();
      this.show = true;

      let response;
      $('#ic-modal-confirm').on('click', () => {
        response = $('#ic-modal-input').val();
        if (!response) {
          warn('You can\'t leave this empty');
        } else {
          this.close();
          cb(response);
        }
      });
      $('#ic-modal-cancel').on('click', () => warn('You need to complete this action'));
      $('#ic-backdrop').on('click', () => warn('You need to complete this action'));
    }

    _prompt(html, cb, value = '') {
      $('#ic-modal-container').empty().append(html);
      $('#ic-modal-input').val(value).select();
      this.addBackdropIfNecessary();
      this.show = true;

      let response;
      $('#ic-modal-confirm').on('click', () => {
        response = $('#ic-modal-input').val();
        $(window).off('keydown', this.enterAsSubmit);
        this.close();
        cb(true, response);
      });
      $('#ic-modal-cancel').on('click', () => {
        this.close();
        $(window).off('keydown', this.enterAsSubmit);
        cb(false);
      });
      $('#ic-backdrop').on('click', () => {
        response = $('#ic-modal-input').val();
        $(window).off('keydown', this.enterAsSubmit);
        this.close();
        // Don't call cb here
      });

      $(window).on('keydown', this.enterAsSubmit);
    }

    enterAsSubmit(ev) {
      if (ev.which === 13) { // Enter key
        $('#ic-modal-confirm').click();
      }
    }

    prompt({
      heading = '',
      body = '',
      defaultValue = '',
      cb = _.noop,
    }) {
      let bodyHtml = `<h3>${heading}</h3>`;

      if (typeof body === 'string') {
        bodyHtml += `<p>${body}</p>`;
      } else if (body.length > 0) {
        _.each(body, p => bodyHtml += `<p>${p}</p>`);
      }

      bodyHtml += '<input id="ic-modal-input"/>';

      const html = this.getModalHtml(
        bodyHtml,
        '<button id="ic-modal-confirm">Submit</button>',
        '<button id="ic-modal-cancel">Cancel</button>',
      );

      this._prompt(html, cb, defaultValue);
    }

    close() {
      $('#ic-modal-cancel').off('click');
      $('#ic-modal-confirm').off('click');
      $('#ic-backdrop').off('click');
      $('#ic-modal-container').empty();
      this.show = false;
    }
  }

  let instance;

  return {
    getInstance: () => {
      if (instance == null) {
        instance = new Modal();
        instance.constructor = null;
      }

      return instance;
    }
  };
})();

export default ModalSingleton;
