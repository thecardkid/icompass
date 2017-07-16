'use strict';

import _ from 'underscore';

const defaultState = {
    selected: [],
    sandbox: [],
    drafts: [],
    color: null
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
        text: null, color: 'grey', x: 0.5, y: 0.5, user: action.user,
        doodle: document.getElementById('ic-doodle').toDataURL()
    };

    return {...state,
        drafts: state.drafts.concat(doodle)
    };
};

export default (state = {}, action) => {
    switch(action.type) {
        case 'normalMode':
        case 'compactMode':
            return defaultState;

        case 'visualMode':
            return {
                ...state,
                selected: (new Array(action.notes.length)).fill(false),
                sandbox: _.map(action.notes, n => Object.assign({}, n))
            };

        case 'draftMode':
            return {
                ...state,
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

        case 'styleAll':
            let sandbox = _.map(state.sandbox, (n) => {
                let style = Object.assign({}, n.style, action.style);
                return Object.assign({}, n, { style });
            });
            return {...state, sandbox};

        case 'colorAll':
            return {...state, color: action.color};

        case 'createDraft':
            return createDraft(state, action);

        case 'dragDraft':
            return dragDraft(state, action);

        case 'editDraft':
            return editDraft(state, action);

        case 'createDoodleDraft':
            return createDoodleDraft(state, action);

        default:
            return state;
    }
};
