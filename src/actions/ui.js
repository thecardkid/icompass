export const setBookmark = (show) => {
  return {
    type: 'setBookmark',
    show,
  };
};

export const showNewNote = (event) => {
  return {
    type: 'showNewNote',
    event,
  };
};

export const showEdit = (idx, note) => {
  return {
    type: 'showEdit',
    idx,
    note,
  };
};

export const showImage = (event) => {
  return {
    type: 'showImage',
    event,
  };
};

export const editImage = (idx, note) => {
  return {
    type: 'editImage',
    idx,
    note,
  };
};

export const showDoodle = (event) => {
  return {
    type: 'showDoodle',
    event,
  };
};

export const switchToImage = () => {
  return {
    type: 'switchToImage',
  };
};

export const switchToDoodle = () => {
  return {
    type: 'switchToDoodle',
  };
};

export const switchToText = () => {
  return {
    type: 'switchToText',
  };
};

export const closeForm = () => {
  return {
    type: 'closeForm',
  };
};

export const focusOnNote = (idx) => {
  return {
    type: 'focusOnNote',
    idx,
  };
};

export const normalMode = () => {
  return {
    type: 'normalMode',
  };
};

export const compactMode = () => {
  return {
    type: 'compactMode',
  };
};

export const visualMode = (len) => {
  return {
    type: 'visualMode',
    len,
  };
};

export const resize = (e) => {
  return {
    type: 'resize',
    screenWidth: e.target.innerWidth,
    screenHeight: e.target.innerHeight,
  };
};

export const setScreenSize = (vw, vh) => {
  return {
    type: 'resize',
    screenWidth: vw,
    screenHeight: vh,
  };
};

export const showShareModal = () => {
  return {
    type: 'showShareModal',
  };
};

export const hideShareModal = () => {
  return {
    type: 'hideShareModal',
  };
};

export const reset = () => {
  return {
    type: 'resetUI',
  };
};
