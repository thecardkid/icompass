import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { Component } from 'react';

import { MODALS, HOST, TWEET } from '../../lib/constants';
import ModalSingleton from '../utils/Modal';
import SocketSingleton from '../utils/Socket';

export default class ShareSubmenu extends Component {
  constructor() {
    super();
    this.modal = ModalSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
  }

  exportCompass = () => {
    setTimeout(() => {
      html2canvas(document.body).then((canvas) => {
        let imgData = canvas.toDataURL('image/png');
        let doc = new jsPDF('l', 'cm', 'a4');
        doc.addImage(imgData, 'PNG', 0, 0, 30, 18);
        doc.save('compass.pdf');
      });
    }, 500);
  };

  shareEditLink = () => {
    this.socket.emitMetric('sidebar edit link');
    this.modal.alert(MODALS.SHARE_LINK(`${HOST}compass/edit/${this.props.compass.editCode}`));
  };

  shareViewOnlyLink = () => {
    this.socket.emitMetric('sidebar view link');
    this.modal.alert(MODALS.SHARE_LINK(`${HOST}compass/view/${this.props.compass.viewCode}`));
  };

  showPdfPrompt = () => {
    this.socket.emitMetric('sidebar pdf');
    this.modal.confirm(MODALS.EXPORT_PDF, (exportAsPDF) => {
      if (exportAsPDF) this.exportCompass();
    });
  };

  tweetThis = () => {
    this.socket.emitMetric('sidebar tweet');
    const tweetURL = TWEET + this.props.compass.viewCode;
    window.open(tweetURL, '_blank').focus();
  };

  render() {
    return (
      <div className={'ic-menu ic-submenu ic-share-submenu'}>
        <section>
          <div className={'ic-menu-item default'} onClick={this.shareEditLink}>
            Edit Link
          </div>
          <div className={'ic-menu-item'} onClick={this.shareViewOnlyLink}>
            View-Only Link
          </div>
          <div className={'ic-menu-item'} onClick={this.showPdfPrompt}>
            Export to PDF
          </div>
          <div className={'ic-menu-item'} onClick={this.tweetThis}>
            Twitter
          </div>
        </section>
      </div>
    );
  }
}
