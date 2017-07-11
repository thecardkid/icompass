import React, { Component } from 'react';
import Draggable from 'react-draggable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';

import * as uiActions from 'Actions/ui';
import * as workspaceActions from 'Actions/workspace';

import { COLORS, STICKY_COLORS } from 'Lib/constants';

const SELECTED = {background: COLORS.DARK, color: 'white', border: '1px solid white'};

class VisualModeToolbar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bold: false,
            italic: false,
            underline: false
        };

        this.bold = this.bold.bind(this);
        this.italicize = this.italicize.bind(this);
        this.underline = this.underline.bind(this);
        this.submitChanges = this.submitChanges.bind(this);
    }

    bold() {
        let value = !this.state.bold;
        this.setState({bold: value});
        this.props.workspaceActions.boldAll(value);
    }

    italicize() {
        let value = !this.state.italic;
        this.setState({italic: value});
        this.props.workspaceActions.italicizeAll(value);
    }

    underline() {
        let value = !this.state.underline;
        this.setState({underline: value});
        this.props.workspaceActions.underlineAll(value);
    }

    submitChanges() {
        let noteIds = [];
        let transformation = { style: Object.assign({}, this.state) };
        let w = this.props.workspace;

        _.map(w.sandbox, (n, i) => {
            if (w.selected[i]) noteIds.push(n._id);
        });
        this.props.socket.emitBulkEditNotes(noteIds, transformation);
        this.props.uiActions.normalMode();
    }

    render() {
        return (
            <Draggable><div id="ic-visual-toolbar">
                <button className="ic-bulk-edit"
                    style={this.state.bold ? SELECTED : null}
                    onClick={this.bold}>
                        <b>B</b>
                </button>
                <button className="ic-bulk-edit"
                    style={this.state.italic ? SELECTED : null}
                    onClick={this.italicize}>
                        <i>I</i>
                </button>
                <button className="ic-bulk-edit"
                    style={this.state.underline ? SELECTED : null}
                    onClick={this.underline}>
                        <u>U</u>
                </button>
                <button className="ic-visual-action"
                    onClick={this.submitChanges}>
                    Submit
                </button>
            </div></Draggable>
        );
    }
}

function mapStateToProps(state) {
    return {
        ui: state.ui,
        workspace: state.workspace,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        uiActions: bindActionCreators(uiActions, dispatch),
        workspaceActions: bindActionCreators(workspaceActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(VisualModeToolbar);

