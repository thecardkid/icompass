export const set = (compass, mode) => {
    return {
        type: 'setCompass',
        compass, mode
    };
};

export const reset = () => {
    return {
        type: 'resetCompass'
    };
};
