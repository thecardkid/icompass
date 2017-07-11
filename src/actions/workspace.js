
export const selectNote = (idx) => {
    return {
        type: 'selectNote',
        idx
    };
};

export const boldAll = (value) => {
    return {
        type: 'styleAll',
        style: { bold: value }
    };
};

export const italicizeAll = (value) => {
    return {
        type: 'styleAll',
        style: { italic: value }
    };
};

export const underlineAll = (value) => {
    return {
        type: 'styleAll',
        style: { underline: value }
    };
};
