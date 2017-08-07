'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';
import ReactTooltip from 'react-tooltip';

import Modal from 'Utils/Modal.jsx';

import * as uiActions from 'Actions/ui';

import { MODALS, EDITING_MODE } from 'Lib/constants';

class ModesToolbar extends Component {
    constructor(props) {
        super(props);
        this.modal = new Modal();

        this.changeMode = this.changeMode.bind(this);
        this.handleChangeMode = this.handleChangeMode.bind(this);
    }

    changeMode(mode) {
        switch (mode) {
            case 'ic-mode-normal':
                return this.props.uiActions.normalMode();
            case 'ic-mode-compact':
                return this.props.uiActions.compactMode();
            case 'ic-mode-visual':
                return this.props.uiActions.visualMode(this.props.notes.length);
            case 'ic-mode-draft':
                return this.props.uiActions.draftMode();
            default:
                return;
        }
    }

    handleChangeMode(e) {
        let elemId = e.target.id;
        if (this.props.draftMode && elemId !== 'ic-mode-draft'
            && !_.isEmpty(this.props.drafts)) {
            this.modal.confirm(MODALS.EXIT_DRAFT_MODE, (exit) => {
                if (exit) this.changeMode(elemId);
            });
        } else {
            this.changeMode(elemId);
        }
    }

    render() {
        return (
            <div id="ic-modes">
                <button id="ic-mode-draft"
                        data-tip data-for="draft-tooltip"
                        className={this.props.draftMode ? 'selected' : 'unselected'}
                        onClick={this.handleChangeMode}>
                    Draft
                </button>
                <ReactTooltip id="draft-tooltip" place="left" effect="solid">
                    <span>Draft notes and release them one at a time</span>
                </ReactTooltip>
                <button id="ic-mode-visual"
                        data-tip data-for="visual-tooltip"
                        className={this.props.visualMode ? 'selected' : 'unselected'}
                        onClick={this.handleChangeMode}>
                    Select
                </button>
                <ReactTooltip id="visual-tooltip" place="left" effect="solid">
                    <span>Format many notes at once</span>
                </ReactTooltip>
                <button id="ic-mode-compact"
                        data-tip data-for="compact-tooltip"
                        className={this.props.compactMode ? 'selected' : 'unselected'}
                        onClick={this.handleChangeMode}>
                    Compact
                </button>
                <ReactTooltip id="compact-tooltip" place="bottom" effect="solid">
                    <span>For smaller devices</span>
                </ReactTooltip>
                <button id="ic-mode-normal"
                        data-tip data-for="normal-tooltip"
                        className={this.props.normalMode ? 'selected' : 'unselected'}
                        onClick={this.handleChangeMode}>
                    Normal
                </button>
                <ReactTooltip id="normal-tooltip" place="bottom" effect="solid">
                    <span>Ship notes as you go</span>
                </ReactTooltip>
            </div>
        );
    }
}

ModesToolbar.propTypes = {
    notes: PropTypes.arrayOf(PropTypes.object).isRequired,
    ui: PropTypes.object.isRequired,
    drafts: PropTypes.arrayOf(PropTypes.object).isRequired,
    uiActions: PropTypes.objectOf(PropTypes.func).isRequired,
    normalMode: PropTypes.bool.isRequired,
    compactMode: PropTypes.bool.isRequired,
    visualMode: PropTypes.bool.isRequired,
    draftMode: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
    return {
        notes: state.notes,
        ui: state.ui,
        normalMode: state.ui.editingMode === EDITING_MODE.NORMAL || false,
        compactMode: state.ui.editingMode === EDITING_MODE.COMPACT || false,
        visualMode: state.ui.editingMode === EDITING_MODE.VISUAL || false,
        draftMode: state.ui.editingMode === EDITING_MODE.DRAFT || false,
        drafts: state.workspace.drafts || [],
    };
}

function mapDispatchToProps(dispatch) {
    return {
        uiActions: bindActionCreators(uiActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ModesToolbar);

