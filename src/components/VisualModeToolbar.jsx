'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';

import * as uiActions from 'Actions/ui';
import * as workspaceActions from 'Actions/workspace';

import { COLORS, PROMPTS, STICKY_COLORS } from 'Lib/constants';

const SELECTED = {background: COLORS.DARK, color: 'white', border: '2px solid white'},
    SELECTED_COLOR_BORDER = '2px solid orangered';

class VisualModeToolbar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bold: null,
            italic: null,
            underline: null,
            color: null
        };

        this.bold = this.bold.bind(this);
        this.italicize = this.italicize.bind(this);
        this.underline = this.underline.bind(this);
        this.colorPick = this.colorPick.bind(this);
        this.getSelectedNotes = this.getSelectedNotes.bind(this);
        this.bulkDelete = this.bulkDelete.bind(this);
        this.cancel = this.cancel.bind(this);
        this.submit = this.submit.bind(this);
    }

    bold() {
        let bold = !this.state.bold;
        this.setState({ bold });
        this.props.workspaceActions.boldAll(bold);
    }

    italicize() {
        let italic = !this.state.italic;
        this.setState({ italic });
        this.props.workspaceActions.italicizeAll(italic);
    }

    underline() {
        let underline = !this.state.underline;
        this.setState({ underline });
        this.props.workspaceActions.underlineAll(underline);
    }

    getSelectedNotes() {
        let w = this.props.workspace;
        let noteIds = [];
        _.map(w.sandbox, (n, i) => {
            if (w.selected[i]) noteIds.push(n._id);
        });
        return noteIds;
    }

    colorPick(c) {
        let color = this.state.color === c ? null : c;
        this.setState({ color });
        this.props.workspaceActions.colorAll(color);
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
        let { bold, italic, underline } = this.state;
        let transformation = { style: { bold, italic, underline}, color: this.state.color };
        this.props.socket.emitBulkEditNotes(this.getSelectedNotes(), transformation);
        this.cancel();
    }

    getPalette() {
        let style;
        return _.map(STICKY_COLORS, (c, i) => {
            style = { background: c };
            if (c === this.state.color) style['border'] = SELECTED_COLOR_BORDER;
            return (
                <button onClick={() => this.colorPick(c)}
                        key={'color'+i}
                        id={c.substring(1)}
                        className="ic-visual-color"
                        style={style}
                />
            );
        });
    }

    render() {
        return (
            <Draggable><div id="ic-visual-toolbar">
                <div className="ic-visual-group">
                    <button className="ic-bulk-edit bold"
                        style={this.state.bold ? SELECTED : null}
                        onClick={this.bold}>
                            <b>B</b>
                    </button>
                    <button className="ic-bulk-edit italic"
                        style={this.state.italic ? SELECTED : null}
                        onClick={this.italicize}>
                            <i>I</i>
                    </button>
                    <button className="ic-bulk-edit underline"
                        style={this.state.underline ? SELECTED : null}
                        onClick={this.underline}>
                            <u>U</u>
                    </button>
                </div>
                <hr />
                <div className="ic-visual-group">
                    {this.getPalette()}
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

VisualModeToolbar.propTypes = {
    socket: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
    workspace: PropTypes.object.isRequired,
    uiActions: PropTypes.objectOf(PropTypes.func).isRequired,
    workspaceActions: PropTypes.objectOf(PropTypes.func).isRequired,
};

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

