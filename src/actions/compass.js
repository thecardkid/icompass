export const set = (compass, mode) => {
    return {
        type: 'setCompass',
        compass, mode
    };
};

export const remove = () => {
    return {
        type: 'removeCompass'
    };
};
