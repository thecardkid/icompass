'use strict';

let modalInstance;

export default class Modal {
    constructor() {
        if (!modalInstance) {
            modalInstance = this;
        }

        return modalInstance;
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
            '<div id="ic-modal-body"><h3>' + text + '</h3><input id="ic-modal-input" /></div>' +
            '<div id="ic-modal-footer"><hr /><button id="ic-modal-confirm">Submit</button>';
    }

    prompt(text, cb) {
        $('#ic-modal-container').empty().append(this.generatePrompt(text));
        this.addBackdropIfNecessary();

        let name;
        $('#ic-modal-confirm').on('click', () => {
            name = $('#ic-modal-input').val();
            this.close();
            cb(name);
        });
        $('#ic-backdrop').on('click', () => {
            name = $('#ic-modal-input').val();
            this.close();
            cb(name);
        });
    }

    close() {
        $('#ic-modal-cancel').off('click');
        $('#ic-modal-confirm').off('click');
        $('#ic-backdrop').off('click');
        $('#ic-modal-container').empty();
    }
}
