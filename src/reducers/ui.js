import { EDITING_MODE } from '../../lib/constants.js';

const defaultState = {
  forms: {
    newText: false,
    newImage: false,
    newDoodle: false,
    editText: false,
    editImage: false,
  },
  focusedNote: -1,
  vw: 0,
  vh: 0,
  editingMode: EDITING_MODE.NORMAL,
};

const showNewNote = (state, action) => {
  let newText = true;
  let e = action.event;
  if (e) {
    // mobile touch events come with touches[] array
    let touchX = e.clientX || e.touches[0].clientX,
      touchY = e.clientY || e.touches[0].clientY;
    newText = {
      x: touchX / state.vw,
      y: touchY / state.vh,
    };
  }
  return {
    ...state,
    forms: {
      ...defaultState.forms,
      newText,
    }
  };
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case 'showNewNote':
      return showNewNote(state, action);

    case 'showEdit':
      return {
        ...state,
        forms: {
          ...defaultState.forms,
          editText: action.noteIdx,
        },
      };

    case 'showDoodle':
      return {
        ...state,
        forms: {
          ...defaultState.forms,
          newDoodle: true,
        },
      };

    case 'closeForm':
      return {
        ...state,
        forms: { ...defaultState.forms },
      };

    case 'focusOnNote':
      return { ...state, focusedNote: action.idx };

    case 'resize':
      return { ...state, vw: action.screenWidth, vh: action.screenHeight };

    case 'normalMode':
      return { ...state, editingMode: EDITING_MODE.NORMAL };

    case 'compactMode':
      return { ...state, editingMode: EDITING_MODE.COMPACT };

    case 'visualMode':
      return { ...state, editingMode: EDITING_MODE.VISUAL };

    case 'draftMode':
      return { ...state, editingMode: EDITING_MODE.DRAFT };

    case 'resetUI':
      return defaultState;

    default:
      return state;
  }
};

