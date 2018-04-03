import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import DoodleForm from '../components/DoodleForm.jsx';
import NoteForm from '../components/NoteForm.jsx';
import TimerForm from '../components/TimerForm.jsx';

import * as workspaceX from '../actions/workspace';

import { EDITING_MODE } from '../../lib/constants';
import Socket from '../utils/Socket';

class FormManager extends Component {
  constructor(props) {
    super(props);

    this.socket = new Socket();
  }

  renderNoteForm() {
    return (
      <NoteForm style={this.props.center(300, 230)}
                mode={this.props.draftMode ? 'make draft' : 'make'}
                note={{}}
                position={this.props.ui.newNote}
                ship={this.props.draftMode ? this.props.workspaceX.createDraft : this.socket.emitNewNote}
                {...this.props.commonAttrs} />
    );
  }

  renderEditForm() {
    return (
      <NoteForm style={this.props.center(300, 230)}
                mode={this.props.draftMode ? 'edit draft' : 'edit'}
                idx={this.props.ui.editNote}
                note={this.props.notes[this.props.ui.editNote]}
                ship={this.props.draftMode ? this.props.workspaceX.editDraft : this.socket.emitEditNote}
                {...this.props.commonAttrs} />
    );
  }

  renderDoodleForm() {
    return (
      <DoodleForm style={this.props.center(450, 345)}
                  ship={this.props.draftMode ? this.props.workspaceX.createDoodleDraft : this.socket.emitNewDoodle}
                  color={this.props.color}
                  {...this.props.commonAttrs} />
    );
  }

  renderTimerForm() {
    return (
      <TimerForm style={this.props.center(300, 150)}
                 ship={this.socket.emitCreateTimer}
                 {...this.props.commonAttrs} />
    );
  }

  render() {
    let form;
    if (this.props.ui.newNote)
      form = this.renderNoteForm();
    else if (typeof this.props.ui.editNote === 'number')
      form = this.renderEditForm();
    else if (this.props.ui.doodleNote)
      form = this.renderDoodleForm();
    else if (this.props.ui.timerConfig)
      form = this.renderTimerForm();

    if (form) return <div id="ic-backdrop">{form}</div>;
    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    me: state.users.me,
    color: state.users.nameToColor[state.users.me],
    notes: state.notes,
    ui: state.ui,
    draftMode: state.ui.editingMode === EDITING_MODE.DRAFT || false,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    workspaceX: bindActionCreators(workspaceX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FormManager);
