export default (state = {me: ''}, action) => {
    switch(action.type) {
        case 'setUsers':
            return {
                ...state,
                colors: action.manager.colors,
                nameToColor: action.manager.usernameToColor
            };
        case 'setClientName':
            return {
                ...state,
                me: action.clientName
            };
        default:
            return state;
    }
};
