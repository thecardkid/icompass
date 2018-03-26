'use strict';

import $ from 'jquery';
import { browserHistory } from 'react-router';

let instance;

export default class Modal {
  constructor() {
    if (!instance) {
      this.show = false;
      instance = this;
    }

    return instance;
  }

  addBackdropIfNecessary() {
    if ($('#ic-backdrop').length === 0) {
      $('#ic-modal-container').append('<div id="ic-backdrop"></div>');
    }
  }

  generateConfirm(modal) {
    let clazz = modal.danger ? 'danger' : 'confirm';
    return '<div id="ic-modal">' +
      '<div id="ic-modal-body">' + modal.text + '</div>' +
      '<div id="ic-modal-footer"><hr /><button id="ic-modal-confirm" class="' + clazz + '">' + modal.confirm + '</button>' +
      '<button id="ic-modal-cancel">' + modal.cancel + '</button></div></div>';
  }

  confirm(modal, cb) {
    $('#ic-modal-container').empty().append(this.generateConfirm(modal));
    this.addBackdropIfNecessary();
    this.show = true;

    $('#ic-modal-confirm').on('click', () => {
      this.close();
      cb(true);
    });
    $('#ic-modal-cancel').on('click', () => {
      this.close();
      cb(false);
    });
    $('#ic-backdrop').on('click', () => {
      this.close();
      cb(false);
    });
  }

  generateAlert(text) {
    return '<div id="ic-modal">' +
      '<div id="ic-modal-body">' + text + '</div>' +
      '<div id="ic-modal-footer"><hr /><button id="ic-modal-confirm">OK</button>';
  }

  alert(text, cb) {
    $('#ic-modal-container').empty().append(this.generateAlert(text));
    this.addBackdropIfNecessary();
    this.show = true;

    $('#ic-modal-confirm').on('click', () => {
      this.close();
      if (cb) cb();
    });
    $('#ic-backdrop').on('click', () => {
      this.close();
      if (cb) cb();
    });
  }

  generatePrompt(text) {
    return '<div id="ic-modal">' +
      '<div id="ic-modal-body"><h3>' + text + '</h3><input id="ic-modal-input" autofocus="true" /></div>' +
      '<div id="ic-modal-footer"><hr />' +
      '<button id="ic-modal-confirm">Submit</button><button id="ic-modal-cancel">Cancel</button></div>';
  }

  prompt(text, cb) {
    $('#ic-modal-container').empty().append(this.generatePrompt(text));
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
      cb(response);
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
