import $ from 'jquery';
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

    onEvent({ onConfirm, onCancel, onBackdrop }) {
      const $confirm = $('#ic-modal-confirm');
      const $cancel = $('#ic-modal-cancel');
      const $backdrop = $('#ic-backdrop');
      this.show = true;

      $confirm.on('click', () => {
        this.close();
        onConfirm();
      });
      $cancel.on('click', () => {
        this.close();
        onCancel();
      });
      $backdrop.on('click', () => {
        this.close();
        onBackdrop();
      });
    }

    generateConfirm(modal) {
      const clazz = modal.danger ? 'danger' : 'confirm';
      return this.getModalHtml(
        modal.text,
        `<button id="ic-modal-confirm" class="${clazz}">${modal.confirm}</button>`,
        `<button id="ic-modal-cancel">${modal.cancel}</button>`,
      );
    }

    confirm(modal, cb) {
      this.renderModal(this.generateConfirm(modal));
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

    alert(text, cb = _.noop) {
      this.renderModal(this.generateAlert(text));
      this.onEvent({
        onConfirm: cb,
        onCancel: _.noop,
        onBackdrop: cb,
      });
    }

    alertPrivacyStatement = () => {
      const text = `
        <h3>Privacy Statement</h3>
        <p>
          iCompass will not share your Compass, code, data, or any personal
          information included in your compass with any third party.
          <br/><br/>
          Anyone who has your Compass' edit code with will be able to modify,
          add, or delete any and all data in your Compass. Save and share your
          Compass link with care, and ask any collaborator to do the same.
         </p>
      `;
      this.alert(text, _.noop);
    };

    alertFeedback = (code) => {
      const text = `
        <h3>We'd love to hear from you!</h3>
        <p>
          It's a huge help to us if you reach out with your experiences and questions! Please email
          <a href="mailto:hieumaster95@gmail.com"><u>Hieu</u></a> (app creator) or 
          <a href="mailto:ela@innovatorscompass.org"><u>Ela</u></a> (Compass creator).
          Or <a href="${TWEET + code}"><u>tweet</u></a>!
          <br/><br/>
          To report a bug or request a feature, please go
          <a href="https://github.com/thecardkid/innovators-compass/issues" target="_blank"
          rel="noopener noreferrer"><u>here</u></a> and click New issue.
          <br/><br/>
          If you are reporting a bug, please list the steps to reproduce or include screenshots.
          If requesting a new feature, please be specific!
        </p>
      `;
      this.alert(text, _.noop);
    };

    alertCompassPrompt = () => {
      const text = `
        <h3>The Innovator's Compass</h3>
        <p>Starting something or feeling stuck? Use five questions, asked by all kinds of innovators, to make things better.</p>
        <p>Explore anything you're doing, alone or with others. You'll see challenges in new ways.</p>
        <p>
          <b>1. PEOPLE: Who could be involved?</b> ...including you? For and with everyone involved, explore...</p>
        <p>
          <b>2. OBSERVATIONS: What's happening? Why?</b> What are people doing? Saying? Thinking? Feeling? Why? See all sides, ups and downs.
        </p>
        <p>
          <b>3. PRINCIPLES: What matters most</b> for everyone involved? Principles often compete - inspiring us to get creative!
        </p>
        <p>
          <b>4. IDEAS: What ways are there?</b> Anyone and anything can help. Look around for ideas! Play with who/what/when/where/how.
        </p>
        <p>
          <b>5. EXPERIMENTS: What's a step to try?</b> With little time/risk/cost? Do it! What happens for all involved (#1 & 2)?
        </p>
        <p>
          Really explore. Look, listen, feel; use words, draw, move, make. In this order (P.O.P.I.E.) or any way that moves you forward.
        </p>
        <p>For more information, visit <a href="http://innovatorscompass.org" target="_blank">innovatorscompass.org</a>.</p>
      `;
      this.alert(text, _.noop);
    };

    alertExplainModes = () => {
      const text = `
        <h3>What are these modes?</h3>
        <p><b>Standard mode</b> is what you are in by default</p>
        <p><b>Compact mode</b> make notes take up much less space - it is meant for smaller devices.</p>
        <p><b>Bulk Edit</b> mode allows you to edit notes in bulk! Hold down Shift and click on any note to enter this mode.</p>
      `;

      this.alert(text, _.noop);
    };

    alertAboutUs = () => {
      const text = `
        <h3>Hi!</h3>
        <p>
          Ela Ben-Ur's mission is making powerful ways forward accessible for any person and moment. She distilled Innovators' Compass from Design Thinking and other practices over a 20-year journey through IDEO, MIT and Olin - and continues to evolve it in collaboration with people around the world, from parents to educators to organizational leaders. More tools and many examples are at <a href="innovatorscompass.org"><u>innovatorscompass.org</u></a>.
        </p>
        <p>My name is Hieu Nguyen, and I am the creator of this app. I am an Olin graduate, class of 2018. Having worked with this design framework from classes with Ela, I saw the potential in an online collaborative Compass and made it a reality.</p>
        <p>We offer this app for free so you can move forward with it in challenges big or small. So please:</p>
        <p>1. Use it, and<br/>2. Invite others to do the same!</p>
        <p>To changing the world for free,</p>
        <p>Hieu and Ela</p>
      `;

      this.alert(text, _.noop);
    };

    generatePrompt(html) {
      return this.getModalHtml(
        `${html}<input id="ic-modal-input"/>`,
        '<button id="ic-modal-confirm">Submit</button>',
        '<button id="ic-modal-cancel">Cancel</button>',
      );
    }

    promptForEmail(cb) {
      let html = `
        <h3>Receive a Link to this Workspace</h3>
        <p>
          You'll need the link to the compass to access it again. To email yourself the link now,
          enter your email address below.
          <br/><br/>
          I will not store your email address or send you spam.
        </p>
        <input id="ic-modal-input" placeholder="enter email or leave blank">
      `;

      html = this.getModalHtml(
        html,
        '<button id="ic-modal-confirm">Submit</button>',
      );

      return this._prompt(html, cb);
    }

    saveViaEmail(cb) {
      let html = `
        <h3>Receive a Link to this Workspace</h3>
        <p>
          You'll need the link to the compass to access it again. To email yourself the link now,
          enter your email address below.
          <br/><br/>
          I will not store your email address or send you spam.
        </p>
      `;

      return this.prompt(html, cb);
    }

    promptForCenter(warn, cb) {
      const html = this.getModalHtml(
        `<h3>1. Who\'s involved, including you?</h3>
         <input id="ic-modal-input" />
         <p>For and with everyone involved, explore...</p>`,
        '<button id="ic-modal-confirm">Submit</button>',
      );
      $('#ic-modal-container').empty().append(html);
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

    editCenter(currentVal, cb) {
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

    prompt(text, cb, value = '') {
      this._prompt(this.generatePrompt(text), cb, value);
    }

    _prompt(html, cb, value = '') {
      $('#ic-modal-container').empty().append(html);
      $('#ic-modal-input').val(value).select();
      this.addBackdropIfNecessary();
      this.show = true;

      let response;
      $('#ic-modal-confirm').on('click', () => {
        response = $('#ic-modal-input').val();
        this.close();
        cb(true, response);
      });
      $('#ic-modal-cancel').on('click', () => {
        this.close();
        cb(false);
      });
      $('#ic-backdrop').on('click', () => {
        response = $('#ic-modal-input').val();
        this.close();
        cb(false, response);
      });
    }

    alertRouteErrors(validCode, validUsername) {
      let err = '<h3>There was a problem with your login info</h3>';

      if (!validCode) err += '<p>Your code is not valid</p>';
      if (!validUsername) err += '<p>Username can only contain letters, and must not be longer than 15 characters</p>';

      err += '<p>You will now be directed to the login page</p>';
      this.alert(err, () => browserHistory.push('/'));
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
