const defaultState = {
  nameToColor: {},
  usernames: [],
  me: '',
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case 'setUsers':
      return {
        ...state,
        usernames: action.usernames,
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
