import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as uiX from '@actions/ui';
import { MODAL_NAME } from '@utils/constants';

class ImageModal extends Component {
  dontClose(e) {
    e.stopPropagation();
  }

  render() {
    if (this.props.openModal !== MODAL_NAME.IMAGE) {
      return null;
    }

    const { src, background } = this.props.modalExtras;
    const style = {};
    if (background) {
      style.background = background;
    }

    return ReactDOM.createPortal(
      <div id={'ic-backdrop2'} onClick={this.props.uiX.closeAllModals}>
        <div id={'ic-modal-scroller'}>
          <div className={'ic-dynamic-modal'}
               onClick={this.dontClose}
               style={{ width: 600, background: 'none' }}
          >
            <div id="ic-modal-image" style={style}>
              <img src={src} alt={'image'} />
            </div>
          </div>
        </div>
      </div>
    , document.getElementById('ic-modal-container2'));
  }
}

const mapStateToProps = (state) => {
  return {
    modalExtras: state.ui.modalExtras,
    openModal: state.ui.openModal,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageModal);
