'use strict';

import _ from 'underscore';

const defaultState = {
    selected: [],
    drafts: [],
    color: null, bold: null, italic: null, underline: null
};

const createDraft = (state, action) => {
    let note = Object.assign({}, action.note);
    note.draft = true;
    note.color = 'grey';

    return {
        ...state,
        drafts: state.drafts.concat([ note ])
    };
};

const dragDraft = (state, action) => {
    let { idx, x, y } = action;
    let n = state.drafts[idx];
    let dragged = Object.assign({}, n, { x, y });
    let drafts = state.drafts.slice(0, idx)
        .concat(dragged)
        .concat(state.drafts.slice(idx + 1));
    return {...state, drafts};
};

const editDraft = (state, action) => {
    let { idx, updated } = action;
    let n = Object.assign({}, state.drafts[idx], updated);
    let drafts = state.drafts.slice(0, idx)
        .concat(n)
        .concat(state.drafts.slice(idx + 1));
    return {...state, drafts};
};

const createDoodleDraft = (state, action) => {
    let doodle = {
        text: null, color: 'grey', x: 0.5, y: 0.5,
        user: action.user, draft: true,
        doodle: document.getElementById('ic-doodle').toDataURL()
    };

    return {...state,
        drafts: state.drafts.concat(doodle)
    };
};

const updateDrafts = (state, action) => {
    let drafts = _.filter(state.drafts, (e) => e.draft);
    drafts = action.notes.concat(drafts);

    return {...state, drafts};
};

const undraft = (state, action) => {
    let { idx } = action;
    let n = state.drafts[idx];
    delete n.draft;
    let drafts = state.drafts.slice(0, idx)
        .concat(n)
        .concat(state.drafts.slice(idx + 1));
    return {...state, drafts};
};

export default (state = {}, action) => {
    switch(action.type) {
        case 'normalMode':
        case 'compactMode':
            return defaultState;

        case 'visualMode':
            return {
                ...defaultState,
                selected: (new Array(action.notes.length)).fill(false)
            };

        case 'draftMode':
            return {
                ...defaultState,
                drafts: action.notes
            };

        case 'selectNote':
            return {
                ...state,
                selected: [
                    ...state.selected.slice(0, action.idx),
                    !state.selected[action.idx],
                    ...state.selected.slice(action.idx + 1)
                ]
            };

        case 'toggleBold':
            return {...state, bold: !state.bold};

        case 'toggleItalic':
            return {...state, italic: !state.italic};

        case 'toggleUnderline':
            return {...state, underline: !state.underline};

        case 'colorAll':
            let color = (action.color === state.color ? null : action.color);
            return {...state, color};

        case 'removeNotesIfSelected':
            return removeNotesIfSelected(state, action);

        case 'createDraft':
            return createDraft(state, action);

        case 'dragDraft':
            return dragDraft(state, action);

        case 'editDraft':
            return editDraft(state, action);

        case 'createDoodleDraft':
            return createDoodleDraft(state, action);

        case 'updateDrafts':
            return updateDrafts(state, action);

        case 'undraft':
            return undraft(state, action);

        default:
            return state;
    }
};
