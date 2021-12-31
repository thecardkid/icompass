import { EDITING_MODES } from '@utils/constants.js';

const defaultState = {
  forms: {
    formInfo: {},
    newText: false,
    newImage: false,
    newDoodle: false,
    editText: false,
    editImage: false,
  },
  tutorial: {
    enabled: false,
    active: false,
    step: 0,
  },
  openModal: null,
  modalBacklog: [],
  modalExtras: {},
  toast: {
    type: 'success',
    message: '',
  },
  dragCenterEnabled: false,
  focusedNote: -1,
  disableEmailReminder: false,
  vw: 0,
  vh: 0,
  editingMode: EDITING_MODES.NORMAL,
  device: {
    isMobile: false,
  },
  isFiona: false,
};

const showNewNote = (state, action, formType) => {
  let formInfo = { x: 0.5, y: 0.5 };
  const { event } = action;
  if (event) {
    // mobile touch events come with touches[] array
    const touchX = event.clientX || event.touches[0].clientX;
    const touchY = event.clientY || event.touches[0].clientY;
    formInfo = {
      x: touchX / state.vw,
      y: touchY / state.vh,
    };
  }
  return {
    ...state,
    forms: {
      ...defaultState.forms,
      [formType]: true,
      formInfo,
    }
  };
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case 'enableDragCenter':
      return {
        ...state,
        dragCenterEnabled: true,
      };

    case 'disableDragCenter':
      return {
        ...state,
        dragCenterEnabled: false,
      };

    case 'showNewNote':
      return showNewNote(state, action, 'newText');

    case 'showEdit':
      return {
        ...state,
        forms: {
          ...defaultState.forms,
          editText: true,
          formInfo: {
            ...action.note,
            idx: action.idx,
          }
        },
      };

    case 'showImage':
      return showNewNote(state, action, 'newImage');

    case 'editImage':
      return {
        ...state,
        forms: {
          ...defaultState.forms,
          editImage: true,
          formInfo: {
            ...action.note,
            idx: action.idx,
          }
        },
      };

    case 'showDoodle':
      return showNewNote(state, action, 'newDoodle');

    case 'switchToImage':
      return {
        ...state,
        forms: {
          ...defaultState.forms,
          formInfo: {...state.forms.formInfo},
          newImage: true,
        },
      };

    case 'switchToDoodle':
      return {
        ...state,
        forms: {
          ...defaultState.forms,
          formInfo: {...state.forms.formInfo},
          newDoodle: true,
        },
      };

    case 'switchToText':
      return {
        ...state,
        forms: {
          ...defaultState.forms,
          formInfo: { ...state.forms.formInfo },
          newText: true,
        },
      };

    case 'closeForm':
      return {
        ...state,
        forms: { ...defaultState.forms },
      };

    case 'changeFormColor':
      return {
        ...state,
        forms: {
          ...state.forms,
          formInfo: {
            ...state.forms.formInfo,
            color: action.color,
          },
        },
      };

    case 'focusOnNote':
      return { ...state, focusedNote: action.idx };

    case 'resize':
      return { ...state, vw: action.screenWidth, vh: action.screenHeight };

    case 'normalMode':
      return { ...state, editingMode: EDITING_MODES.NORMAL };

    case 'compactMode':
      return { ...state, editingMode: EDITING_MODES.COMPACT };

    case 'visualMode':
      return { ...state, editingMode: EDITING_MODES.VISUAL };

    case 'resetUI':
      return {
        ...defaultState,
        // Don't reset these two, as it causes weirdness if the Workspace is
        // unmounted then mounted, e.g. navigating back to landing page, then
        // forward again to workspace.
        vw: state.vw,
        vh: state.vh,
      };

    case 'setIsFiona':
      return { ...state, isFiona: true };

    case 'setToast':
      return {
        ...state,
        toast: action.toast,
      };

    case 'clearToast':
      return {
        ...state,
        toast: {},
      };

    case 'openModal':
      // Simple backlog system to let modals interrupt each other.
      let backlog = state.modalBacklog;
      let openModal = action.name;
      if (openModal === null) { // Closing action
        if (backlog.length > 0) {
          openModal = backlog.pop();
        }
      } else { // Opening action
        if (state.openModal && openModal !== state.openModal) {
          backlog.push(state.openModal);
        }
      }
      return {
        ...state,
        openModal,
        modalExtras: {},
        modalBacklog: backlog,
      };

    case 'setModalExtras':
      return {
        ...state,
        modalExtras: action.modalExtras,
      };

    case 'autoEmailSent':
      return { ...state, disableEmailReminder: true };

    case 'setIsMobile':
      return { ...state, device: { ...state.device, isMobile: true }};

    case 'enableTutorial':
      return {
        ...state,
        tutorial: {
          ...state.tutorial,
          enabled: true,
        },
      };

    case 'setTutorialActive':
      if (!state.tutorial.enabled) {
        return state;
      }
      return { ...state, tutorial: {
        ...state.tutorial,
        active: action.active,
        step: action.atStep,
      }};

    case 'tutorialGoToStep':
      if (!state.tutorial.enabled) {
        return state;
      }
      if (!state.tutorial.active) {
        return state;
      }
      if (action.stepNum !== state.tutorial.step + 1) {
        return state;
      }
      return { ...state, tutorial: {
        ...state.tutorial,
        active: true,
        step: action.stepNum,
      }};

    case 'tutorialNextStep':
      if (!state.tutorial.enabled) {
        return state;
      }
      if (!state.tutorial.active) {
        return state;
      }
      return { ...state, tutorial: {
        ...state.tutorial,
        active: true,
        step: state.tutorial.step + 1,
      }};

    default:
      return state;
  }
};

