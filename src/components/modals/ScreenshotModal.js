import html2canvas from 'html2canvas';
import React, { Component } from 'react';
import { isMobile } from 'react-device-detect';

import DynamicModal from './DynamicModal';
import ToastSingleton from '@utils/Toast';

export default class ScreenshotModal extends Component {
  state = { canvas: null };
  toast = ToastSingleton.getInstance();

  componentDidMount() {
    this.exportPng();
  }

  componentDidUpdate() {
    if (this.state.canvas) {
      if (this.refs.canvas.children.length > 1) {
        this.refs.canvas.children[1].remove();
      }
      this.refs.canvas.appendChild(this.state.canvas);
    }
  }

  close = () => {
    this.setState({ canvas: null });
    this.props.close();
  };

  exportPng = async () => {
    this.toast.info('Converting to file...');
    try {
      const canvas = await html2canvas(document.getElementById('compass'), {
        allowTaint: true,
        logging: false,
      });

      this.setState({ canvas });
      this.toast.clear();
    } catch (ex) {
      this.toast.error('There was a problem generating a PDF. Please take a screenshot instead.');
    }
  };

  render() {
    if (isMobile) {
      return (
        <DynamicModal
          className={'ic-screenshot'}
          heading={'Export as Screenshot'}
          close={this.close}>
          <div className={'warning'}>
            <b>NOTE:</b> This feature is not available on mobile/tablet. Please access this workspace on your desktop instead.
          </div>
        </DynamicModal>
      );
    }

    return (
      <DynamicModal
        className={'ic-screenshot'}
        heading={'Export as Screenshot'}
        close={this.close}>
        <div ref={'canvas'} id={'exported-png'}>
          <p>Right click on the image below and choose "Save Image As..."</p>
        </div>
      </DynamicModal>
    );
  }
}
