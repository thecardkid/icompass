'use strict';

let modalInstance;

export default class Modal {
    constructor() {
        if (!modalInstance) {
            this.confirm = this.confirm.bind(this);
            this.close = this.close.bind(this);
            modalInstance = this;
        }

        return modalInstance;
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
        $('#ic-modal-confirm').on('click', () => {
            this.close();
            cb(true);
        });
        $('#ic-modal-cancel').on('click', () => {
            this.close();
            cb(false);
        });
    }

    close() {
        $('#ic-modal-cancel').off('click');
        $('#ic-modal-confirm').off('click');
        $('#ic-modal-container').empty();
    }
}
