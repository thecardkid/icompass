'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';

import Modal from 'Utils/Modal';

import * as uiActions from 'Actions/ui';
import * as workspaceActions from 'Actions/workspace';

import { COLORS, STICKY_COLORS, MODALS } from 'Lib/constants';

const SELECTED = {background: COLORS.DARK, color: 'white', border: '2px solid white'},
    SELECTED_COLOR_BORDER = '2px solid orangered';

class VisualModeToolbar extends Component {
    constructor(props) {
        super(props);
        this.modal = new Modal();

        this.getSelectedNotes = this.getSelectedNotes.bind(this);
        this.bulkDelete = this.bulkDelete.bind(this);
        this.cancel = this.cancel.bind(this);
        this.submit = this.submit.bind(this);
        this.getPalette = this.getPalette.bind(this);
    }

    getSelectedNotes() {
        let noteIds = [];
        _.map(this.props.notes, (n, i) => {
            if (this.props.workspace.selected[i]) noteIds.push(n._id);
        });
        return noteIds;
    }

    bulkDelete() {
        this.modal.confirm(MODALS.BULK_DELETE_NOTES, (deleteNotes) => {
            if (deleteNotes) {
                this.props.socket.emitBulkDeleteNotes(this.getSelectedNotes());
                this.cancel();
            }
        });
    }

    cancel() {
        this.props.uiActions.normalMode();
    }

    submit() {
        let { bold, italic, underline, color } = this.props.workspace;
        let transformation = { style: { bold, italic, underline}, color};
        this.props.socket.emitBulkEditNotes(this.getSelectedNotes(), transformation);
        this.cancel();
    }

    getPalette() {
        let style,
            w = this.props.workspace,
            wx = this.props.workspaceActions;
        return _.map(STICKY_COLORS, (c, i) => {
            style = { background: c };
            if (c === w.color) style['border'] = SELECTED_COLOR_BORDER;
            return (
                <button onClick={() => wx.colorAll(c)}
                        key={'color'+i}
                        id={c.substring(1)}
                        className="ic-visual-color"
                        style={style} />
            );
        });
    }

    render() {
        if (!this.props.show) return null;

        let w = this.props.workspace,
            wx = this.props.workspaceActions;

        return (
            <Draggable><div id="ic-visual-toolbar">
                <div id="ic-visual-hint">Click on stickies to select them</div>
                <hr />
                <div className="ic-visual-group">
                    <button className="ic-bulk-edit bold"
                        style={w.bold ? SELECTED : null}
                        onClick={wx.toggleBold}>
                            <b>B</b>
                    </button>
                    <button className="ic-bulk-edit italic"
                        style={w.italic ? SELECTED : null}
                        onClick={wx.toggleItalic}>
                            <i>I</i>
                    </button>
                    <button className="ic-bulk-edit underline"
                        style={w.underline ? SELECTED : null}
                        onClick={wx.toggleUnderline}>
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
    show: PropTypes.bool.isRequired,
    notes: PropTypes.arrayOf(PropTypes.object).isRequired,
    ui: PropTypes.object.isRequired,
    workspace: PropTypes.object.isRequired,
    uiActions: PropTypes.objectOf(PropTypes.func).isRequired,
    workspaceActions: PropTypes.objectOf(PropTypes.func).isRequired,
};

function mapStateToProps(state) {
    return {
        notes: state.notes,
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

