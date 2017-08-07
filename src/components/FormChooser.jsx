'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import NoteForm from 'Components/NoteForm.jsx';
import DoodleForm from 'Components/DoodleForm.jsx';
import TimerForm from 'Components/TimerForm.jsx';

import * as workspaceActions from 'Actions/workspace';

import { EDITING_MODE } from 'Lib/constants';

class FormChooser extends Component {
    constructor(props) {
        super(props);
    }

    renderNoteForm() {
        return (
            <NoteForm style={this.props.center(300,230)}
                 mode={this.props.draftMode ? 'make draft' : 'make'}
                 note={{}}
                 position={this.props.ui.newNote}
                 ship={this.props.draftMode ? this.props.workspaceActions.createDraft : this.props.socket.emitNewNote}
                 {...this.props.commonAttrs} />
        );
    }

    renderEditForm() {
        return (
             <NoteForm style={this.props.center(300,230)}
                 mode={this.props.draftMode ? 'edit draft' : 'edit'}
                 idx={this.props.ui.editNote}
                 note={this.props.notes[this.props.ui.editNote]}
                 ship={this.props.draftMode ? this.props.workspaceActions.editDraft : this.props.socket.emitEditNote}
                 {...this.props.commonAttrs} />
        );
    }

    renderDoodleForm() {
        return (
            <DoodleForm style={this.props.center(450, 345)}
               ship={this.props.draftMode ? this.props.workspaceActions.createDoodleDraft : this.props.socket.emitNewDoodle}
               {...this.props.commonAttrs} />
        );
    }

    renderTimerForm() {
        return (
            <TimerForm style={this.props.center(300,150)}
                ship={this.props.socket.emitCreateTimer}
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

FormChooser.propTypes = {
    socket: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
    center: PropTypes.func.isRequired,
    commonAttrs: PropTypes.shape({
        bg: PropTypes.string,
        user: PropTypes.string,
        close: PropTypes.func
    }).isRequired,
    notes: PropTypes.arrayOf(PropTypes.object).isRequired,

    draftMode: PropTypes.bool.isRequired,
    workspaceActions: PropTypes.objectOf(PropTypes.func).isRequired,
};

function mapStateToProps(state) {
    return {
        ui: state.ui,
        draftMode: state.ui.editingMode === EDITING_MODE.DRAFT || false,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        workspaceActions: bindActionCreators(workspaceActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FormChooser);

