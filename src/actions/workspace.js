export const enterVisualMode = (n) => {
    return {
        type: 'enterVisualMode',
        n
    };
};

export const selectNote = (idx) => {
    return {
        type: 'selectNote',
        idx
    };
};
