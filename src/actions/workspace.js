'use strict';

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

export const colorAll = (color) => {
    return {
        type: 'colorAll',
        color
    };
};

export const createDraft = (note) => {
    return {
        type: 'createDraft',
        note
    };
};

export const dragDraft = (idx, x, y) => {
    return {
        type: 'dragDraft',
        idx, x, y
    };
};

export const editDraft = (updated, idx) => {
    return {
        type: 'editDraft',
        updated, idx
    };
};

export const createDoodleDraft = (user) => {
    return {
        type: 'createDoodleDraft',
        user
    }
};
