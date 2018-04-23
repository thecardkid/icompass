export const showNewNote = (event) => {
  return {
    type: 'showNewNote',
    event,
  };
};

export const showEdit = (noteIdx) => {
  return {
    type: 'showEdit',
    noteIdx,
  };
};

export const showImage = () => {
  return {
    type: 'showImage'
  };
};

export const showDoodle = () => {
  return {
    type: 'showDoodle',
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

export const draftMode = () => {
  return {
    type: 'draftMode',
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

export const reset = () => {
  return {
    type: 'resetUI',
  };
};
