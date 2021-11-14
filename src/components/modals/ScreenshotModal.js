import html2canvas from 'html2canvas';
import React, { Component } from 'react';
import { isMobile } from 'react-device-detect';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as uiX from '@actions/ui';
import { MODAL_NAME } from '@utils/constants';
import DynamicModal from './DynamicModal';

class ScreenshotModal extends Component {
  componentDidUpdate() {
    if (this.props.isOpen) {
      if (this.refs.canvas.children.length > 1) {
        this.refs.canvas.children[1].remove();
      }
      html2canvas(document.getElementById('compass'), {
        allowTaint: true,
        logging: false,
      }).then($canvas => {
        this.refs.canvas.appendChild($canvas);
      }).catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
        this.props.uiX.toastError('There was a problem generating an image of your workspace. Please take a screenshot instead.');
      });
    }
  }

  renderBody() {
    if (isMobile) {
      return (
        <div className={'warning'}>
          This feature is not available on mobile/tablet. Please access this workspace on your desktop instead.
        </div>
      );
    }
    return (
      <div ref={'canvas'} id={'exported-png'}>
        <p>Right click on the image below and choose "Save Image As..."</p>
      </div>
    );
  }

  render() {
    return (
      <DynamicModal
        modalName={MODAL_NAME.EXPORT_AS_SCREENSHOT}
        className={'ic-screenshot'}
        heading={'Export workspace as image'}
        width={600}
      >
        {this.renderBody()}
      </DynamicModal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isOpen: state.ui.openModal === MODAL_NAME.EXPORT_AS_SCREENSHOT,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ScreenshotModal);
