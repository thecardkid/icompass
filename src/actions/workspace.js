export const ensureSelectNote = (idx) => {
  return {
    type: 'ensureSelectNote',
    idx,
  };
};

export const selectNote = (idx) => {
  return {
    type: 'selectNote',
    idx,
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

export const setEditCode = (editCode) => {
  return {
    type: 'setEditCode',
    editCode,
  };
};

export const createDoodleDraft = (note) => {
  return {
    type: 'createDoodleDraft',
    note,
  };
};

export const deleteDraft = (idx) => {
  return {
    type: 'deleteDraft',
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

export const showNoteContextMenu = (style, noteIdx) => {
  return {
    type: 'showNoteContextMenu',
    contextMenu: {
      style,
      noteIdx,
    },
  };
};

export const hideNoteContextMenu = () => {
  return {
    type: 'showNoteContextMenu',
    contextMenu: null,
  };
};

export const showCompassContextMenu = (style) => {
  return {
    type: 'showCompassContextMenu',
    contextMenu: {
      style,
    },
  };
};

export const hideCompassContextMenu = () => {
  return {
    type: 'showCompassContextMenu',
    contextMenu: null,
  };
};
