export const selectNote = (idx) => {
  return {
    type: 'selectNote',
    idx,
  };
};

export const toggleBold = () => {
  return {
    type: 'toggleBold',
  };
};

export const toggleItalic = () => {
  return {
    type: 'toggleItalic',
  };
};

export const toggleUnderline = () => {
  return {
    type: 'toggleUnderline',
  };
};

export const colorAll = (color) => {
  return {
    type: 'colorAll',
    color,
  };
};

export const createDraft = (note) => {
  return {
    type: 'createDraft',
    note,
  };
};

export const dragDraft = (idx, x, y) => {
  return {
    type: 'dragDraft',
    idx, x, y,
  };
};

export const editDraft = (updated, idx) => {
  return {
    type: 'editDraft',
    updated, idx,
  };
};

export const createDoodleDraft = (note) => {
  return {
    type: 'createDoodleDraft',
    note,
  };
};

export const undraft = (idx) => {
  return {
    type: 'undraft',
    idx,
  };
};

export const updateSelected = (len) => {
  return {
    type: 'updateSelected',
    len,
  };
};

export const removeNotesIfSelected = (deletedIdx) => {
  return {
    type: 'removeNotesIfSelected',
    deletedIdx,
  };
};

export const setTimer = (timer) => {
  return {
    type: 'setTimer',
    timer,
  };
};
