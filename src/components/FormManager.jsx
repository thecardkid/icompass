import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import DoodleForm from '../components/DoodleForm.jsx';
import NoteForm from '../components/NoteForm.jsx';

import * as uiX from '../actions/ui';
import * as workspaceX from '../actions/workspace';

import { EDITING_MODE, PROMPTS } from '../../lib/constants';
import Socket from '../utils/Socket';
import Toast from '../utils/Toast';

class FormManager extends Component {
  constructor(props) {
    super(props);
    this.toast = Toast.getInstance();
    this.socket = Socket.getInstance();
  }

  renderNoteForm() {
    return (
      <NoteForm mode={this.props.draftMode ? 'make draft' : 'make'}
                note={{}}
                position={this.props.forms.newText}
                ship={this.props.draftMode ? this.props.workspaceX.createDraft : this.socket.emitNewNote}
                {...this.props.commonAttrs} />
    );
  }

  renderEditForm() {
    return (
      <NoteForm mode={this.props.draftMode ? 'edit draft' : 'edit'}
                idx={this.props.forms.editText}
                note={this.props.notes[this.props.forms.editText]}
                ship={this.props.draftMode ? this.props.workspaceX.editDraft : this.socket.emitEditNote}
                {...this.props.commonAttrs} />
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
      return this.renderNoteForm();
    }

    if (typeof forms.editText === 'number') {
      if (visualMode) {
        this.props.uiX.closeForm();
        return this.toast.warn(PROMPTS.VISUAL_MODE_NO_CHANGE);
      }
      return this.renderEditForm();
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
