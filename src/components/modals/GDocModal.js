/* global icompass */

import React, { Component } from 'react';
import { isMobile } from 'react-device-detect';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import htmlparser from 'htmlparser2';

import DynamicModal from './DynamicModal';
import { ModalFooter } from './shared';
import * as uiX from '@actions/ui';
import { MODAL_NAME } from '@utils/constants';

class GDocModal extends Component {
  getDefaultDocData() {
    const data = {
      link: '',
      topic: '',
      involved: '',
      authors: new Set(),
      observations: [],
      principles: [],
      ideas: [],
      experiments: [],
    };
    data.getQuadrant = function(x, y) {
      if (x < 0.5) {
        if (y < 0.5) {
          return this.principles;
        } else {
          return this.observations;
        }
      } else {
        if (y < 0.5) {
          return this.ideas;
        } else {
          return this.experiments;
        }
      }
    };
    return data;
  }

  getPreviewSection(header, notes) {
    if (notes.length > 0) {
      let bulletPoints = `
${header}:`;
      notes.forEach(point => {
        bulletPoints += `
    - ${point.text} (${point.user})
`;
      });
      return bulletPoints;
    }
    return '';
  }

  renderBulletPoint(note) {
    if (note.isImage) {
      return <p key={note.text}>- <a href={note.text}>image</a> ({note.user})</p>;
    }
    return <p key={note.text}>- {note.text} ({note.user})</p>;
  }

  renderPreview(data) {
    return (
      <div id={'doc-preview'}>
        <p>Link: <a href={data.link}>{data.link}</a></p>
        <br/>
        <b>Authors:</b> {Array.from(data.authors).join(', ')}
        <br/><br/>
        <b>Topic:</b> {data.topic}
        <br/><br/>
        <b>Who's Involved:</b> {data.involved}
        <br/><br/>
        <b>Observations:</b>
        {data.observations.map(this.renderBulletPoint)}
        <br/>
        <b>Principles:</b>
        {data.principles.map(this.renderBulletPoint)}
        <br/>
        <b>Ideas:</b>
        {data.ideas.map(this.renderBulletPoint)}
        <br/>
        <b>Experiments:</b>
        {data.experiments.map(this.renderBulletPoint)}
      </div>
    );
  }

  copyToClipboard = () => {
    const previewNode = document.getElementById('doc-preview');
    if (document.selection) {
      document.selection.empty();
      const range = document.body.createTextRange();
      range.moveToElementText(previewNode);
      range.select();
    } else if (window.getSelection) {
      window.getSelection().removeAllRanges();
      const range = document.createRange();
      range.selectNode(previewNode);
      window.getSelection().addRange(range);
    }
    document.execCommand('copy');
    this.props.uiX.toastInfo('Contents copied to clipboard');
  };

  render() {
    if (isMobile) {
      return (
        <DynamicModal
          className={'ic-gdoc'}
          heading={'Export workspace text'}
          close={this.props.close}>
          <div className={'ic-modal-warning'}>
            This feature is not available on mobile/tablet. Please access this workspace on your desktop instead.
          </div>
        </DynamicModal>
      );
    }

    const docData = this.getDefaultDocData();
    docData.link = `${icompass.config.APP_HOST}/compass/view/${this.props.compass.viewCode}`;
    docData.topic = this.props.compass.topic;
    docData.involved = this.props.compass.center;
    this.props.notes.forEach(n => {
      if (n.doodle) return;
      let raw = '';
      const parser = new htmlparser.Parser({
        ontext: (text) => raw += text,
      }, { decodeEntities: true });
      parser.write(n.text);
      parser.end();
      docData.getQuadrant(n.x, n.y).push({
        text: raw,
        isImage: n.isImage,
        user: n.user,
      });
      docData.authors.add(n.user);
    });

    return (
      <DynamicModal
        modalName={MODAL_NAME.EXPORT_AS_TEXT}
        className={'ic-gdoc'}
        heading={'Export workspace text'}
        width={500}
      >
        <div className={'ic-modal-warning'}>
          Doodles will not be included. All formatting (bold, italics, etc.) will be omitted.
        </div>
        {this.renderPreview(docData)}
        <ModalFooter confirmButton={{
          text: 'Copy to Clipboard',
          keepOpenOnConfirm: true,
          onConfirm: this.copyToClipboard,
        }} />
      </DynamicModal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    notes: state.notes,
    compass: state.compass,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GDocModal);
