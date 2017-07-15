'use strict';

export const newMessage = (msg) => {
    return {
        type: 'newMessage',
        msg
    };
};

export const userLeft = (name) => {
    return {
        type: 'newMessage',
        msg: {
            info: true,
            text: name + ' left'
        }
    };
};

export const userJoined = (name) => {
    return {
        type: 'newMessage',
        msg: {
            info: true,
            text: name + ' joined'
        }
    };
};

export const unread = () => {
    return {
        type: 'setUnread',
        value: true
    };
};

export const read = () => {
    return {
        type: 'setUnread',
        value: false
    };
};

export const reset = () => {
    return {
        type: 'resetChat'
    };
};
