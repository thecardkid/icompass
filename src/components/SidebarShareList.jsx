import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { Component } from 'react';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket.js';
import Storage from '../utils/Storage';
import Toast from '../utils/Toast';

import { TWEET, HOST, PROMPTS, MODALS, REGEX } from '../../lib/constants';

export default class SidebarShareList extends Component {
  constructor(props, context) {
    super(props, context);
    this.toast = Toast.getInstance();
    this.modal = Modal.getInstance();
    this.socket = Socket.getInstance();
  }

  exportCompass = () => {
    this.props.uiX.setSidebarVisible(false);
    this.props.uiX.setChatVisible(false);

    setTimeout(() => {
      html2canvas(document.body).then((canvas) => {
        let imgData = canvas.toDataURL('image/png');
        let doc = new jsPDF('l', 'cm', 'a4');
        doc.addImage(imgData, 'PNG', 0, 0, 30, 18);
        doc.save('compass.pdf');
      });
    }, 500);
  };

  showPdfPrompt = () => {
    this.socket.emitMetric('sidebar pdf');
    this.modal.confirm(MODALS.EXPORT_PDF, (exportAsPDF) => {
      if (exportAsPDF) this.exportCompass();
    });
  };

  shareEditLink = () => {
    this.socket.emitMetric('sidebar edit link');
    this.modal.alert(MODALS.SHARE_LINK(`${HOST}compass/edit/${this.props.compass.editCode}`));
  };

  shareViewOnlyLink = () => {
    this.socket.emitMetric('sidebar view link');
    this.modal.alert(MODALS.SHARE_LINK(`${HOST}compass/view/${this.props.compass.viewCode}`));
  };

  tweetThis = () => {
    this.socket.emitMetric('sidebar tweet');
    const tweetURL = TWEET + this.props.compass.viewCode;
    window.open(tweetURL, '_blank').focus();
  };

  triggerEmailModal = () => {
    this.socket.emitMetric('sidebar email');
    this.emailReminder();
  };

  emailReminder = () => {
    this.modal.promptForEmail((status, email) => {
      if (!status) return;

      if (REGEX.EMAIL.test(email)) {
        return this.socket.emitSendMail(this.props.compass.editCode, this.props.me, email);
      } else {
        this.toast.error(`"${email}" does not look like a valid email`);
        this.emailReminder();
      }
    });
  };

  openNewCompass = () => {
    this.socket.emitMetric('sidebar create new');
    window.open(HOST, '_blank').focus();
  };

  save = () => {
    const { topic, editCode } = this.props.compass;
    this.socket.emitMetric('sidebar bookmark');
    this.modal.prompt(MODALS.SAVE_BOOKMARK, (submit, bookmarkName) => {
      if (submit) {
        let username = this.props.me.replace(/\d+/g, '');
        Storage.addBookmark(bookmarkName, editCode, username);
        this.toast.success(PROMPTS.SAVE_SUCCESS);
      }
    }, topic);
  };

  render() {
    return (
      <div className="ic-sidebar-list" name="share">
        <h2>Share</h2>
        <button className="ic-action" onClick={this.openNewCompass}>
          <i className="material-icons">add_circle</i>
          <p>create new</p>
        </button>
        <button name="save" className="ic-action bookmark" onClick={this.save}>
          <i className="material-icons">star</i>
          <p>bookmark</p>
        </button>
        <button name="email" className="ic-action" onClick={this.triggerEmailModal}>
          <i className="fa fa-envelope"/>
          <p>email</p>
        </button>
        <button name="share-edit" id={this.props.compass.editCode} className="ic-action" onClick={this.shareEditLink}>
          <i className="material-icons">edit</i>
          <p>editing link</p>
        </button>
        <button name="share-view" id={this.props.compass.viewCode} className="ic-action"
                onClick={this.shareViewOnlyLink}>
          <i className="material-icons">remove_red_eye</i>
          <p>view-only link</p>
        </button>
        <button name="export" className="ic-action" onClick={this.showPdfPrompt}>
          <i className="material-icons">picture_as_pdf</i>
          <p>export to pdf</p>
        </button>
        <button name="tweet" className="ic-action tweet" onClick={this.tweetThis}>
          <i className="fa fa-twitter" style={{ color: 'white' }}/>
          <p>tweet this</p>
        </button>
      </div>
    );
  }
}
