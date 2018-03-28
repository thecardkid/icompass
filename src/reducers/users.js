const defaultState = { me: '' };

export default (state = defaultState, action) => {
  switch (action.type) {
    case 'setUsers':
      return {
        ...state,
        colors: action.manager.colors,
        nameToColor: action.manager.usernameToColor,
      };
    case 'setClientName':
      return {
        ...state,
        me: action.clientName,
      };
    case 'resetUsers':
      return defaultState;
    default:
      return state;
  }
};
