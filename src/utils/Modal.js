import $ from 'jquery';
import { browserHistory } from 'react-router';

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

    alert(text, cb = () => {}) {
      this.renderModal(this.generateAlert(text));
      this.onEvent({
        onConfirm: cb,
        onCancel: () => {},
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
      this.alert(text, () => {});
    };

    alertFeedback = () => {
      const text = `
        <h3>We'd love to hear from you!</h3>
        <p>
          Please feel free reach out to Ela or me (under credits) with your experiences
          and questions about using the Innovators' Compass - they are a huge help!
          <br/><br/>
          If you would like to report a bug or request a feature, go
          <a href="https://github.com/thecardkid/innovators-compass/issues" target="_blank"
          rel="noopener noreferrer">here</a> and click New issue.
          <br/><br/>
          If you are reporting a bug, please list the steps to reproduce or include screenshots.
          If requesting a new feature, please be specific!
        </p>
      `;
      this.alert(text, () => {});
    };

    alertCompassPrompt = () => {
      const text = `
        <h3>The Innovator's Compass</h3>
        <p>Starting something or feeling stuck? Use five questions, asked by all kinds of innovators, to make things better.</p>
        <p>Explore anything you're doing, alone or with others. You'll see challenges in new ways.</p>
        <p>
          <span class="bold">1. PEOPLE: Who could be involved?</span> ...including you? For and with everyone involved, explore...</p>
        <p>
          <span class="bold">2. OBSERVATIONS: What's happening? Why?</span> What are people doing? Saying? Thinking? Feeling? Why? See all sides, ups and downs.
        </p>
        <p>
          <span class="bold">3. PRINCIPLES: What matters most</span> for everyone involved? Principles often compete - inspiring us to get creative!
        </p>
        <p>
          <span class="bold">4. IDEAS: What ways are there?</span> Anyone and anything can help. Look around for ideas! Play with who/what/when/where/how.
        </p>
        <p>
          <span class="bold">5. EXPERIMENTS: What's a step to try?</span> With little time/risk/cost? Do it! What happens for all involved (#1 & 2)?
        </p>
        <p>
          Really explore. Look, listen, feel; use words, draw, move, make. In this order (P.O.P.I.E.) or any way that moves you forward.
        </p>
        <p>For more information, visit <a href="http://innovatorscompass.org" target="_blank">innovatorscompass.org</a>.</p>
      `;
      this.alert(text, () => {});
    };

    alertExplainModes = () => {
      const text = `
        <h3>What are these modes?</h3>
        <p><b>Standard mode</b> is what you are in by default</p>
        <p><b>Compact mode</b> make notes take up much less space - it is meant for smaller devices.</p>
        <p><b>Bulk Edit</b> mode allows you to edit notes in bulk! Hold down Shift and click on any note to enter this mode.</p>
      `;

      this.alert(text, () => {});
    };

    generatePrompt(html) {
      return this.getModalHtml(
        `${html}<input id="ic-modal-input" />`,
        '<button id="ic-modal-confirm">Submit</button>',
        '<button id="ic-modal-cancel">Cancel</button>',
      );
    }

    promptForEmail(cb) {
      const html = `
        <h3>Email Yourself a Link to this Workspace</h3>
        <p>
          You'll need the link to the compass to access it again. To email yourself the link now,
          enter your email address below. Leave blank if you do not want this email.
          <br/><br/>
          I will not store your email address or send you spam.
        </p>
      `;
      this.prompt(html, cb);
    }

    promptForCenter(warn, cb) {
      const html = '<h3>1. Who could be involved, including you?</h3><p>For and with everyone involved, explore...</p>';
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

    prompt(text, cb, value) {
      $('#ic-modal-container').empty().append(this.generatePrompt(text));
      $('#ic-modal-input').val(value || '').select();
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
