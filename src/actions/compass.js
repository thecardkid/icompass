export const set = (compass, viewOnly) => {
    return {
        type: 'setCompass',
        compass, viewOnly
    };
};

export const reset = () => {
    return {
        type: 'resetCompass'
    };
};
