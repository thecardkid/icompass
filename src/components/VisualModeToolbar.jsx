import React, { Component } from 'react';
import Draggable from 'react-draggable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';

import * as uiActions from 'Actions/ui';
import * as workspaceActions from 'Actions/workspace';

import { COLORS, PROMPTS, STICKY_COLORS } from 'Lib/constants';

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
        this.getSelectedNotes = this.getSelectedNotes.bind(this);
        this.bulkDelete = this.bulkDelete.bind(this);
        this.cancel = this.cancel.bind(this);
        this.submit = this.submit.bind(this);
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

    getSelectedNotes() {
        let w = this.props.workspace;
        let noteIds = [];
        _.map(w.sandbox, (n, i) => {
            if (w.selected[i]) noteIds.push(n._id);
        });
        return noteIds;
    }

    bulkDelete() {
        if (confirm(PROMPTS.CONFIRM_BULK_DELETE_NOTES)) {
            this.props.socket.emitBulkDeleteNotes(this.getSelectedNotes());
            this.cancel();
        }
    }

    cancel() {
        this.props.uiActions.normalMode();
    }

    submit() {
        let transformation = { style: Object.assign({}, this.state) };
        this.props.socket.emitBulkEditNotes(this.getSelectedNotes(), transformation);
        this.cancel();
    }

    render() {
        let colors = _.map(STICKY_COLORS, (c, i) => {
            return <button key={i} className="ic-visual-color" style={{background: c}} />
        });

        return (
            <Draggable><div id="ic-visual-toolbar">
                <div className="ic-visual-group">
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
                </div>
                <hr />
                <div className="ic-visual-group">
                    {colors}
                </div>
                <hr />
                <div className="ic-visual-group ic-visual-actions">
                    <button id="ic-bulk-delete" onClick={this.bulkDelete}>
                        delete all
                    </button>
                    <button id="ic-bulk-cancel" onClick={this.cancel}>
                        never mind
                    </button>
                    <button id="ic-bulk-submit" onClick={this.submit}>
                        ship it
                    </button>
                </div>
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

