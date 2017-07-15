'use strict';

import _ from 'underscore';

const defaultState = {
    selected: [],
    sandbox: [],
    color: null
};

export default (state = {}, action) => {
    switch(action.type) {
        case 'visualMode':
            return {
                selected: (new Array(action.notes.length)).fill(false),
                sandbox: _.map(action.notes, n => Object.assign({}, n))
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

        case 'normalMode':
        case 'compactMode':
            return defaultState;

        default:
            return state;
    }
};
