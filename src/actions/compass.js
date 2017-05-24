export const set = (compass) => {
    return {
        type: 'set',
        compass
    };
};

export const remove = () => {
    return {
        type: 'remove'
    };
};
