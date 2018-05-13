import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { Component } from 'react';

import { HOST, TWEET } from '../../lib/constants';
import ToastSingleton from '../utils/Toast';
import SocketSingleton from '../utils/Socket';

const a4Width = 297; // mm
const a4Height = 210; // mm
const a4Ratio = a4Width / a4Height;

export default class ShareModal extends Component {
  constructor(props) {
    super(props);

    this.editLink = `${HOST}/compass/edit/${this.props.compass.editCode}`;
    this.viewLink = `${HOST}/compass/view/${this.props.compass.viewCode}`;
    this.toast = ToastSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
  }

  dontClose(e) {
    e.stopPropagation();
  }

  copyEditLink = () => {
    this.socket.emitMetric('share copy edit');
    const text = document.getElementById('ic-edit-link');
    text.select();
    document.execCommand('copy');
    this.toast.info('Edit link has been copied to clipboard');
  };

  copyViewLink = () => {
    this.socket.emitMetric('share copy view');
    const text = document.getElementById('ic-view-link');
    text.select();
    document.execCommand('copy');
    this.toast.info('View-only link has been copied to clipboard');
  };

  tweetThis = () => {
    this.socket.emitMetric('share tweet');
    const tweetURL = TWEET + this.props.compass.viewCode;
    window.open(tweetURL, '_blank').focus();
  };

  exportPdf = async () => {
    this.toast.info('Converting to PDF...');
    try {
      const pdf = new jsPDF('l', 'mm', 'a4');
      const canvas = await html2canvas(document.getElementById('compass'));
      const w = window.innerWidth;
      const h = window.innerHeight;

      const r = w / h;

      let width, height;
      let x = 0, y = 0;
      if (r > a4Ratio) {
        height = a4Width / r;
        width = a4Width;
        y = (a4Height - height) / 2;
      } else {
        height = a4Height;
        width = r * a4Height;
        x = (a4Width - width) / 2;
      }

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, width, height);

      this.toast.clear();
      window.open(pdf.output('bloburl'), '_blank');
    } catch (ex) {
      this.toast.error('There was a problem generating a PDF. Please take a screenshot instead.');
    }
  };

  render() {
    if (!this.props.show) return null;

    return (
      <div id={'ic-backdrop'} onClick={this.props.close}>
        <div className={'ic-share'} onClick={this.dontClose}>
          <div className={'contents'}>
            <div className={'header'}>
              <h1 className={'title'}>Share this Workspace</h1>
              <button className={'ic-close-window'} onClick={this.props.close}>X</button>
            </div>
            <div className={'ic-share-link'}>
              <p>Anyone can <b>edit</b></p>
              <div className={'share-box'}>
                <input id={'ic-edit-link'} value={this.editLink} readOnly={true} />
                <button className={'copy-edit'} onClick={this.copyEditLink}>Copy</button>
              </div>
            </div>
            <div className={'ic-share-link'}>
              <p>Anyone can <b>view</b></p>
              <div className={'share-box'}>
                <input id={'ic-view-link'} value={this.viewLink} readOnly={true} />
                <button className={'copy-view'} onClick={this.copyViewLink}>Copy</button>
              </div>
            </div>
            <div className={'ic-twitter'}>
              <button name={'pdf'} onClick={this.exportPdf}>Save as PDF</button>
              <button onClick={this.tweetThis}>Tweet</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
