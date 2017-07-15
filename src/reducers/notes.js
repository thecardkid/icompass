'use strict';

export default (state = [], action) => {
    switch(action.type) {
        case 'updateNotes':
            return action.notes;
        case 'dragNote':
            let { idx, x, y } = action;
            let n = state[idx];
            let dragged = Object.assign({}, n, { x, y });
            return [
                ...state.slice(0, idx),
                dragged,
                ...state.slice(idx + 1)
            ];
        case 'resetNotes':
            return [];
        default:
            return state;
    }
};
