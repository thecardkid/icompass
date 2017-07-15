'use strict';

const defaultState = {
    messages: [{
        info: true,
        text: 'These messages will be cleared when you log out'
    }],
    unread: false
};

export default (state = defaultState, action) => {
    switch(action.type) {
        case 'newMessage':
            return {
                ...state,
                messages: state.messages.concat([ action.msg ])
            };
        case 'setUnread':
            return {
                ...state,
                unread: action.value
            };
        case 'resetChat':
            return defaultState;
        default:
            return state;
    }
};

