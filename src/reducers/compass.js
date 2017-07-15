'use strict';

export default (state = {}, action) => {
    switch(action.type) {
        case 'setCompass':
            return Object.assign({}, action.compass, {notes: undefined}, {viewOnly: action.viewOnly});
        case 'resetCompass':
            return {};
        default:
            return state;
    }
};

