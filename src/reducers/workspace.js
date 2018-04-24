import _ from 'underscore';

const defaultState = {
  selected: [],
  drafts: [],
  color: null, bold: null, italic: null, underline: null,
};

const colorAll = (state, action) => {
  let color = (action.color === state.color ? null : action.color);
  return { ...state, color };
};

const removeNotesIfSelected = (state, action) => {
  let selected = _.filter(state.selected, (e, i) => {
    return !_.contains(action.deletedIdx, i);
  });

  return { ...state, selected };
};

const createDraft = (state, action) => {
  let note = Object.assign({}, action.note);
  note.draft = true;
  note.color = 'grey';

  return {
    ...state,
    drafts: state.drafts.concat([note]),
  };
};

const dragDraft = (state, action) => {
  let { idx, x, y } = action;
  let n = state.drafts[idx];
  let dragged = Object.assign({}, n, { x, y });
  let drafts = state.drafts.slice(0, idx)
    .concat(dragged)
    .concat(state.drafts.slice(idx + 1));
  return { ...state, drafts };
};

const editDraft = (state, action) => {
  let { idx, updated } = action;
  let n = Object.assign({}, state.drafts[idx], updated);
  let drafts = state.drafts.slice(0, idx)
    .concat(n)
    .concat(state.drafts.slice(idx + 1));
  return { ...state, drafts };
};

const createDoodleDraft = (state, action) => {
  let note = {
    ...action.note,
    draft: true,
    color: 'grey',
  };

  return {
    ...state,
    drafts: state.drafts.concat(note),
  };
};

/*
1. Note added --> new note is not selected
2. Note edited --> no change
3. Note deleted --> handled separately by `removeNotesIfSelected`
                    from a separate socket emission
 */
const updateSelected = (state, action) => {
  if (action.len > state.selected.length) {
    return { ...state, selected: state.selected.concat([false]) };
  }

  return state;
};

const undraft = (state, action) => {
  let drafts = _.filter(state.drafts, (e, i) => i !== action.idx);
  return { ...state, drafts };
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case 'normalMode':
    case 'compactMode':
      return {
        ...defaultState,
        drafts: [...state.drafts],
      };

    case 'visualMode':
      return {
        ...state,
        selected: (new Array(action.len + state.drafts.length)).fill(false),
      };

    case 'selectNote':
      return {
        ...state,
        selected: [
          ...state.selected.slice(0, action.idx),
          !state.selected[action.idx],
          ...state.selected.slice(action.idx + 1)
        ],
      };

    case 'toggleBold':
      return { ...state, bold: !state.bold };

    case 'toggleItalic':
      return { ...state, italic: !state.italic };

    case 'toggleUnderline':
      return { ...state, underline: !state.underline };

    case 'colorAll':
      return colorAll(state, action);

    case 'removeNotesIfSelected':
      return removeNotesIfSelected(state, action);

    case 'createDraft':
      return createDraft(state, action);

    case 'dragDraft':
      return dragDraft(state, action);

    case 'editDraft':
      return editDraft(state, action);

    case 'createDoodleDraft':
      return createDoodleDraft(state, action);

    case 'updateSelected':
      return updateSelected(state, action);

    case 'undraft':
      return undraft(state, action);

    default:
      return state;
  }
};
