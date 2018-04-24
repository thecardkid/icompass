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
    return (
      <CreateTextForm title={'Create a note'}
                      info={this.props.forms.formInfo}
                      asNote={this.socket.emitNewNote}
                      asDraft={this.props.workspaceX.createDraft}
                      {...this.props.commonAttrs} />
    );
  };

  editTextForm = () => {
    if (this.props.forms.formInfo.draft) {
      return (
        <EditTextForm title={'Edit this draft'}
                      info={this.props.forms.formInfo}
                      ship={this.props.workspaceX.editDraft}
                      {...this.props.commonAttrs} />
      );
    }

    return (
      <EditTextForm title={'Edit this note'}
                      info={this.props.forms.formInfo}
                      ship={this.socket.emitEditNote}
                      {...this.props.commonAttrs} />
    );
  };

  createImageForm = () => {
    return (
      <CreateImageForm title={'Insert a photo'}
                       info={this.props.forms.formInfo}
                       asNote={this.socket.emitNewNote}
                       asDraft={this.props.workspaceX.createDraft}
                       {...this.props.commonAttrs}/>
    );
  };

  editImageForm = () => {
    if (this.props.forms.formInfo.draft) {
     return (
        <EditImageForm title={'Edit photo draft'}
                       info={this.props.forms.formInfo}
                       ship={this.props.workspaceX.editDraft}
                       {...this.props.commonAttrs}
        />
      );
    }

    return (
      <EditImageForm title={'Edit photo link'}
                     info={this.props.forms.formInfo}
                     ship={this.socket.emitEditNote}
                     {...this.props.commonAttrs}
      />
    );
  };

  renderDoodleForm = () => {
    return (
      <DoodleForm asDraft={this.props.workspaceX.createDoodleDraft}
                  asNote={this.socket.emitNewNote}
                  info={this.props.forms.formInfo}
                  {...this.props.commonAttrs}
      />
    );
  };

  renderFormIfNotVisual = (formRenderer) => {
    if (this.props.visualMode) {
      this.toast.warn(PROMPTS.VISUAL_MODE_NO_CREATE);
      return null;
    }

    return formRenderer();
  };

  render() {
    const { forms } = this.props;
    let renderer;

    if (forms.newText) {
      renderer = this.createTextForm;
    } else if (forms.editText) {
      renderer = this.editTextForm;
    } else if (forms.newImage) {
      renderer = this.createImageForm;
    } else if (forms.editImage) {
      renderer = this.editImageForm;
    } else if (forms.newDoodle) {
      renderer = this.renderDoodleForm;
    } else {
      return null;
    }

    return this.renderFormIfNotVisual(renderer);
  };
}

const mapStateToProps = (state) => {
  return {
    me: state.users.me,
    notes: state.notes,
    drafts: state.workspace.drafts,
    forms: state.ui.forms,
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
