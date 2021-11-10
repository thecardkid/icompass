import html2canvas from 'html2canvas';
import React, { Component } from 'react';
import { isMobile } from 'react-device-detect';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as uiX from '@actions/ui';
import DynamicModal from './DynamicModal';

class ScreenshotModal extends Component {
  state = { canvas: null };

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
    try {
      const canvas = await html2canvas(document.getElementById('compass'), {
        allowTaint: true,
        logging: false,
      });
      this.setState({ canvas });
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.error(ex);
      this.props.uiX.toastError('There was a problem generating an image of your workspace. Please take a screenshot instead.');
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

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ScreenshotModal);
