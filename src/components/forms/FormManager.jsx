import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import DoodleForm from './DoodleForm.jsx';
import CreateTextForm from './CreateTextForm';
import EditTextForm from './EditTextForm';

import * as uiX from '../../actions/ui';
import * as workspaceX from '../../actions/workspace';

import { EDITING_MODE, PROMPTS } from '../../../lib/constants';
import Socket from '../../utils/Socket';
import Toast from '../../utils/Toast';
import ImageForm from './ImageForm';
import CreateImageForm from './CreateImageForm';
import EditImageForm from './EditImageForm';

class FormManager extends Component {
  constructor(props) {
    super(props);
    this.toast = Toast.getInstance();
    this.socket = Socket.getInstance();
  }

  createTextForm = () => {
    if (this.props.draftMode) {
      return (
        <CreateTextForm title={'Create a draft'}
                        info={this.props.forms.formInfo}
                        ship={this.props.workspaceX.createDraft}
                        {...this.props.commonAttrs} />
      );
    }

    return (
      <CreateTextForm title={'Create a note'}
                      info={this.props.forms.formInfo}
                      ship={this.socket.emitNewNote}
                      {...this.props.commonAttrs} />
    );
  };

  editTextForm = () => {
    if (this.props.draftMode) {
      return (
        <EditTextForm title={'Edit this draft'}
                      info={this.props.forms.formInfo}
                      ship={this.props.workspaceX.editDraft}
                      {...this.props.commonAttrs} />
      );
    }

    return (
      <EditTextForm title={'Edit this draft'}
                      info={this.props.forms.formInfo}
                      ship={this.socket.emitEditNote}
                      {...this.props.commonAttrs} />
    );
  };

  createImageForm = () => {
    if (this.props.draftMode) {
      return (
        <CreateImageForm title={'Draft an image'}
                         info={this.props.forms.formInfo}
                         ship={this.props.workspaceX.createDraft}
                         {...this.props.commonAttrs}/>
      );
    }

    return (
      <CreateImageForm title={'Insert an image'}
                       info={this.props.forms.formInfo}
                       ship={this.socket.emitNewNote}
                       {...this.props.commonAttrs}/>
    );
  };

  editImageForm = () => {
    if (this.props.draftMode) {
     return (
        <EditImageForm title={'Edit image draft'}
                       info={this.props.forms.formInfo}
                       ship={this.props.workspaceX.editDraft}
                       {...this.props.commonAttrs}
        />
      );
    }

    return (
      <EditImageForm title={'Edit image link'}
                     info={this.props.forms.formInfo}
                     ship={this.socket.emitEditNote}
                     {...this.props.commonAttrs}
      />
    );
  };

  renderDoodleForm = () => {
    return (
      <DoodleForm ship={this.props.draftMode ? this.props.workspaceX.createDoodleDraft : this.socket.emitNewNote}
                  info={this.props.forms.formInfo}
                  color={this.props.color}
                  {...this.props.commonAttrs} />
    );
  };

  renderFormIfNotVisual = (formRenderer) => {
    if (this.props.visualMode) {
      this.toast.warn(PROMPTS.VISUAL_MODE_NO_CREATE);
      return null;
    }

    return formRenderer();
  };

  getForm = () => {
    const { forms } = this.props;

    if (forms.newText) {
      return this.renderFormIfNotVisual(this.createTextForm);
    }

    if (forms.editText) {
      return this.renderFormIfNotVisual(this.editTextForm);
    }

    if (forms.newImage) {
      return this.renderFormIfNotVisual(this.createImageForm);
    }

    if (forms.editImage) {
      return this.renderFormIfNotVisual(this.editImageForm);
    }

    if (forms.newDoodle) {
      return this.renderFormIfNotVisual(this.renderDoodleForm);
    }

    return null;
  };

  render() {
    const form = this.getForm();

    if (form) return <div id="ic-backdrop">{form}</div>;
    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    me: state.users.me,
    color: state.users.nameToColor[state.users.me],
    notes: state.notes,
    drafts: state.workspace.drafts,
    forms: state.ui.forms,
    draftMode: state.ui.editingMode === EDITING_MODE.DRAFT || false,
    visualMode: state.ui.editingMode === EDITING_MODE.VISUAL || false,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    workspaceX: bindActionCreators(workspaceX, dispatch),
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FormManager);
