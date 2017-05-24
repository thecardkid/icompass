export const set = (compass) => {
    return {
        type: 'setCompass',
        compass
    };
};

export const remove = () => {
    return {
        type: 'removeCompass'
    };
};
