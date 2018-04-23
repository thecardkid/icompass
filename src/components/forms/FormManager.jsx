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

  createTextForm() {
    if (this.props.draftMode) {
      return (
        <CreateTextForm title={'Create a draft'}
                        position={this.props.forms.newText}
                        ship={this.props.workspaceX.createDraft}
                        {...this.props.commonAttrs} />
      );
    }

    return (
      <CreateTextForm title={'Create a note'}
                      position={this.props.forms.newText}
                      ship={this.socket.emitNewNote}
                      {...this.props.commonAttrs} />
    );
  }

  editTextForm() {
    if (this.props.draftMode) {
      return (
        <EditTextForm title={'Edit this draft'}
                      idx={this.props.forms.editText}
                      note={this.props.drafts[this.props.forms.editText]}
                      ship={this.props.workspaceX.editDraft}
                      {...this.props.commonAttrs} />
      );
    }

    return (
      <EditTextForm title={'Edit this draft'}
                      idx={this.props.forms.editText}
                      note={this.props.notes[this.props.forms.editText]}
                      ship={this.socket.emitEditNote}
                      {...this.props.commonAttrs} />
    );
  }

  createImageForm() {
    if (this.props.draftMode) {
      return (
        <CreateImageForm title={'Draft an image'}
                         ship={this.props.workspaceX.createDraft}
                         {...this.props.commonAttrs}/>
      );
    }

    return (
      <CreateImageForm title={'Insert an image'}
                       ship={this.socket.emitNewNote}
                       {...this.props.commonAttrs}/>
    );
  }

  editImageForm() {
    if (this.props.draftMode) {
     return (
        <EditImageForm title={'Edit image draft'}
                       idx={this.props.forms.editImage}
                       note={this.props.drafts[this.props.forms.editImage]}
                       ship={this.props.workspaceX.editDraft}
                       {...this.props.commonAttrs}
        />
      );
    }

    return (
      <EditImageForm title={'Edit image link'}
                     idx={this.props.forms.editImage}
                     note={this.props.notes[this.props.forms.editImage]}
                     ship={this.socket.emitEditNote}
                     {...this.props.commonAttrs}
      />
    );
  }

  renderDoodleForm() {
    return (
      <DoodleForm ship={this.props.draftMode ? this.props.workspaceX.createDoodleDraft : this.socket.emitNewNote}
                  color={this.props.color}
                  {...this.props.commonAttrs} />
    );
  }

  getForm = () => {
    const { forms, visualMode } = this.props;

    if (forms.newText) {
      if (visualMode) {
        this.props.uiX.closeForm();
        return this.toast.warn(PROMPTS.VISUAL_MODE_NO_CREATE);
      }
      return this.createTextForm();
    }

    if (typeof forms.editText === 'number') {
      if (visualMode) {
        this.props.uiX.closeForm();
        return this.toast.warn(PROMPTS.VISUAL_MODE_NO_CHANGE);
      }
      return this.editTextForm();
    }

    if (forms.newImage) {
      return this.createImageForm();
    }

    if (typeof forms.editImage === 'number') {
      return this.editImageForm();
    }

    if (forms.newDoodle) {
      if (visualMode) {
        this.props.uiX.closeForm();
        return this.toast.warn(PROMPTS.VISUAL_MODE_NO_CREATE);
      }
      return this.renderDoodleForm();
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
